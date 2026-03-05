import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { deductCredits, estimateVideoCreditCost, CREDIT_COSTS, TIER_FEATURES } from '@/lib/credits';
import { generateVoiceAudio, createDIDTalkingVideo, createHeyGenVideo } from '@/lib/ai-services';

// Determine which video provider to use based on avatar type and user tier
function selectProvider(avatarType: string, userTier: string): 'DID' | 'HEYGEN' {
  // Ultra Realistic always uses HeyGen (Studio/Enterprise only)
  if (avatarType === 'ULTRA_REALISTIC') return 'HEYGEN';
  // Realistic can use either — D-ID is default, HeyGen if user prefers
  // Cartoon and Standard always use D-ID
  return 'DID';
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const {
      postScriptId,
      avatarType = 'STANDARD',
      durationSeconds = 60,
      resolution = '720p',
      hdExport = false,
      expressRender = false,
      preferHeyGen = false,  // User can explicitly request HeyGen
    } = await req.json();

    if (!postScriptId) {
      return NextResponse.json({ error: 'Missing postScriptId' }, { status: 400 });
    }

    // Fetch the PostScript and its avatar
    const postScript = await prisma.postScript.findUnique({
      where: { id: postScriptId },
      include: { avatar: true },
    });

    if (!postScript || !postScript.generatedOutput) {
      return NextResponse.json({ error: 'PostScript not found or not generated' }, { status: 404 });
    }

    // Check if user's tier allows this avatar type
    const tierFeatures = TIER_FEATURES[user.subscriptionTier];
    if (!tierFeatures.avatarTypes.includes(avatarType)) {
      return NextResponse.json({
        error: 'TIER_LOCKED',
        message: `${avatarType} avatars require a higher subscription tier.`,
        currentTier: user.subscriptionTier,
        requiredFeature: avatarType,
      }, { status: 403 });
    }

    // Determine provider
    let provider: 'DID' | 'HEYGEN' = selectProvider(avatarType, user.subscriptionTier);

    // Allow explicit HeyGen preference for Pro+ users on Realistic avatars
    if (preferHeyGen && avatarType === 'REALISTIC' &&
        (user.subscriptionTier === 'PRO' || user.subscriptionTier === 'STUDIO' || user.subscriptionTier === 'ENTERPRISE')) {
      provider = 'HEYGEN';
    }

    // Check that HeyGen API key is configured if HeyGen is selected
    if (provider === 'HEYGEN' && !process.env.HEYGEN_API_KEY) {
      return NextResponse.json({
        error: 'HEYGEN_NOT_CONFIGURED',
        message: 'Ultra Realistic video generation is coming soon. Please use Realistic mode for now.',
      }, { status: 503 });
    }

    // Calculate total credit cost (voice + video)
    const voiceCreditCost = CREDIT_COSTS.VOICE_PER_MINUTE * Math.ceil(durationSeconds / 60);
    const videoCreditCost = estimateVideoCreditCost(avatarType, durationSeconds, hdExport, expressRender);
    const totalCost = voiceCreditCost + videoCreditCost;

    // Check and deduct credits
    try {
      await deductCredits(user.id, totalCost, `${provider} video render: ${avatarType} ${durationSeconds}s`);
    } catch (e: any) {
      if (e.message === 'INSUFFICIENT_CREDITS') {
        return NextResponse.json({
          error: 'INSUFFICIENT_CREDITS',
          balance: user.creditBalance,
          needed: totalCost,
          tier: user.subscriptionTier,
        }, { status: 402 });
      }
      throw e;
    }

    // ========================================
    // Step 1: Generate voice audio via ElevenLabs
    // ========================================
    const voiceId = postScript.avatar.defaultVoiceId || 'default-voice-id';
    const audioBuffer = await generateVoiceAudio({
      text: postScript.generatedOutput,
      voiceId,
    });

    // TODO: In production, upload audioBuffer to cloud storage (S3/Cloudflare R2)
    // and use the public URL. For MVP, using base64 data URL.
    const audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;

    // ========================================
    // Step 2: Create video via selected provider
    // ========================================
    const avatarImageUrl = postScript.avatar.avatarImage || '';
    let providerJobId: string;

    if (provider === 'HEYGEN') {
      // HeyGen path — Ultra Realistic and premium Realistic
      const result = await createHeyGenVideo({
        avatarId: avatarImageUrl, // HeyGen may need a registered avatar ID
        audioUrl,
      });
      providerJobId = result.videoId;
    } else {
      // D-ID path — Cartoon, Standard, and default Realistic
      const result = await createDIDTalkingVideo({
        imageUrl: avatarImageUrl,
        audioUrl,
      });
      providerJobId = result.talkId;
    }

    // ========================================
    // Step 3: Create render job record
    // ========================================
    const renderJob = await prisma.renderJob.create({
      data: {
        userId: user.id,
        avatarId: postScript.avatarId,
        postScriptId,
        provider,
        providerJobId,
        status: 'PROCESSING',
        avatarType: avatarType as any,
        durationSeconds,
        resolution,
        watermark: user.subscriptionTier === 'FREE',
        creditsCharged: totalCost,
        audioUrl,
      },
    });

    // Update PostScript status
    await prisma.postScript.update({
      where: { id: postScriptId },
      data: { status: 'GENERATING', outputFormat: 'VIDEO' },
    });

    return NextResponse.json({
      renderJob,
      provider,
      creditsCharged: totalCost,
      message: `Video rendering started via ${provider}. Poll for status using the job ID.`,
    });
  } catch (error: any) {
    console.error('Render error:', error);
    return NextResponse.json({ error: 'Render failed', details: error.message }, { status: 500 });
  }
}

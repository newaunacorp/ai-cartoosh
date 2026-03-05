import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { deductCredits, CREDIT_COSTS } from '@/lib/credits';
import { generatePostScriptText } from '@/lib/ai-services';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { avatarId, planId, sourceText, scriptType, loopIteration } = await req.json();

    if (!avatarId || !planId || !sourceText || !scriptType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get avatar and plan details
    const avatar = await prisma.avatar.findUnique({ where: { id: avatarId } });
    const plan = await prisma.contentPlan.findUnique({ where: { id: planId } });

    if (!avatar || !plan) {
      return NextResponse.json({ error: 'Avatar or plan not found' }, { status: 404 });
    }

    // Check and deduct credits
    const creditCost = scriptType === 'VERBATIM' ? CREDIT_COSTS.TEXT_VERBATIM : CREDIT_COSTS.TEXT_INTERPRETIVE;

    try {
      await deductCredits(user.id, creditCost, `${scriptType} PostScript generation`);
    } catch (e: any) {
      if (e.message === 'INSUFFICIENT_CREDITS') {
        return NextResponse.json({
          error: 'INSUFFICIENT_CREDITS',
          balance: user.creditBalance,
          needed: creditCost,
          tier: user.subscriptionTier,
        }, { status: 402 });
      }
      throw e;
    }

    // Generate PostScript text via OpenAI
    const generatedText = await generatePostScriptText({
      avatarName: avatar.name,
      personality: avatar.personality,
      planName: plan.planName,
      planType: plan.planType,
      planDescription: plan.description,
      ideas: plan.ideas || '',
      sourceText,
      scriptType: scriptType as 'VERBATIM' | 'INTERPRETIVE',
      loopIteration,
    });

    // Save PostScript
    const postScript = await prisma.postScript.create({
      data: {
        userId: user.id,
        avatarId,
        planId,
        scriptType,
        sourceText,
        generatedOutput: generatedText,
        status: 'DRAFT',
        loopIteration: loopIteration || 1,
      },
    });

    return NextResponse.json({ postScript });
  } catch (error: any) {
    console.error('PostScript generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

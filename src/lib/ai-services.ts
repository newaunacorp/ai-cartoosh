import OpenAI from 'openai';

// ============================================================
// OPENAI - Text Generation & Image Generation
// ============================================================

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePostScriptText(params: {
  avatarName: string;
  personality: string;
  planName: string;
  planType: string;
  planDescription: string;
  ideas: string;
  sourceText: string;
  scriptType: 'VERBATIM' | 'INTERPRETIVE';
  loopIteration?: number;
}): Promise<string> {
  const { avatarName, personality, planName, planType, planDescription, ideas, sourceText, scriptType, loopIteration } = params;

  let userPrompt: string;

  if (scriptType === 'VERBATIM') {
    userPrompt = `You are ${avatarName}, a digital content host with this personality: ${personality}.
Your Post Show is called "${planName}" and it is about: ${planDescription}.

Read the following source material VERBATIM. Format it as a performance script with your name before each line. Add natural delivery notes in brackets like [pause], [emphasis], [look at camera]. Do not change the message or add your own opinions.

Source material:
${sourceText}`;
  } else {
    userPrompt = `You are ${avatarName}, a digital content host with this personality: ${personality}.
Your Post Show is called "${planName}", a ${planType} show about: ${planDescription}.
Creative direction: ${ideas || 'Use your personality to make this entertaining and engaging.'}

${loopIteration && loopIteration > 1 ? `This is loop iteration ${loopIteration}. Create a COMPLETELY FRESH take that is different from any previous version. Vary your delivery style, angle, emphasis, and perspective.` : ''}

Using the following source material as your inspiration and fuel, create an original script in your voice and personality. React to it, comment on it, tell stories about it, make it entertaining. Stay in character throughout.

Source material:
${sourceText}`;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an AI content performer avatar named ${avatarName}. You stay in character at all times. Your personality: ${personality}. Generate engaging, entertaining content scripts.`,
      },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 2000,
    temperature: scriptType === 'VERBATIM' ? 0.3 : 0.85,
  });

  return response.choices[0]?.message?.content || 'Error generating content.';
}

export async function generateAvatarImage(params: {
  name: string;
  description: string;
  style: string;
}): Promise<string> {
  const { name, description, style } = params;

  const styleMap: Record<string, string> = {
    cartoon: 'vibrant cartoon illustration style, bold colors, expressive features',
    illustrated: 'detailed digital illustration, painterly style, artistic',
    stylized: 'modern stylized digital art, clean lines, contemporary',
    photorealistic: 'photorealistic digital portrait, studio lighting, high detail',
  };

  const styleDesc = styleMap[style] || styleMap.cartoon;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `Create a ${styleDesc} avatar portrait of a character named ${name}. Description: ${description}. The avatar should be a polished digital character suitable for hosting a content show. Clean background, expressive face, high quality. Head and shoulders framing.`,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  return response.data?.[0]?.url || '';
}

// ============================================================
// ELEVENLABS - Voice Synthesis
// ============================================================

export async function generateVoiceAudio(params: {
  text: string;
  voiceId: string;
}): Promise<Buffer> {
  const { text, voiceId } = params;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ============================================================
// D-ID - Talking Avatar Video Generation
// ============================================================

export async function createDIDTalkingVideo(params: {
  imageUrl: string;
  audioUrl: string;
}): Promise<{ talkId: string }> {
  const { imageUrl, audioUrl } = params;

  const response = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.DID_API_KEY}`,
    },
    body: JSON.stringify({
      source_url: imageUrl,
      script: {
        type: 'audio',
        audio_url: audioUrl,
      },
      config: {
        fluent: true,
        pad_audio: 0.5,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`D-ID API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return { talkId: data.id };
}

export async function pollDIDTalkStatus(talkId: string): Promise<{
  status: 'created' | 'started' | 'done' | 'error';
  resultUrl?: string;
  error?: string;
}> {
  const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
    headers: {
      'Authorization': `Basic ${process.env.DID_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`D-ID poll error: ${response.status}`);
  }

  const data = await response.json();

  return {
    status: data.status,
    resultUrl: data.result_url,
    error: data.error?.description,
  };
}

// ============================================================
// HEYGEN - Ultra Realistic Video (Phase 2)
// ============================================================

export async function createHeyGenVideo(params: {
  avatarId: string;
  audioUrl: string;
}): Promise<{ videoId: string }> {
  const response = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.HEYGEN_API_KEY || '',
    },
    body: JSON.stringify({
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: params.avatarId,
        },
        voice: {
          type: 'audio',
          audio_url: params.audioUrl,
        },
      }],
      dimension: { width: 1920, height: 1080 },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HeyGen API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return { videoId: data.data.video_id };
}

export async function pollHeyGenVideo(videoId: string): Promise<{
  status: string;
  videoUrl?: string;
  error?: string;
}> {
  const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY || '',
    },
  });

  const data = await response.json();

  return {
    status: data.data?.status || 'unknown',
    videoUrl: data.data?.video_url,
    error: data.data?.error,
  };
}

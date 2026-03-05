import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const avatars = await prisma.avatar.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ avatars });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const {
    name, description, personality, voiceStyle,
    avatarGenerationMethod, worldSetting,
    formalityLevel, energyLevel, humorLevel, verbosityLevel,
  } = body;

  if (!name || !personality) {
    return NextResponse.json({ error: 'Name and personality are required' }, { status: 400 });
  }

  const avatar = await prisma.avatar.create({
    data: {
      userId: user.id,
      name,
      description: description || null,
      personality,
      voiceStyle: voiceStyle || 'PROFESSIONAL',
      avatarGenerationMethod: avatarGenerationMethod || 'PRESET',
      worldSetting: worldSetting || null,
      formalityLevel: formalityLevel ?? 50,
      energyLevel: energyLevel ?? 50,
      humorLevel: humorLevel ?? 50,
      verbosityLevel: verbosityLevel ?? 50,
    },
  });

  return NextResponse.json({ avatar }, { status: 201 });
}

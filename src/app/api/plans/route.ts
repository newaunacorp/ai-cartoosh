import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const avatarId = req.nextUrl.searchParams.get('avatarId');

  const plans = await prisma.contentPlan.findMany({
    where: {
      userId: user.id,
      ...(avatarId ? { avatarId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { avatarId, planName, planType, description, genre, ideas } = await req.json();

  if (!avatarId || !planName || !planType || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const plan = await prisma.contentPlan.create({
    data: {
      userId: user.id,
      avatarId,
      planName,
      planType,
      description,
      genre: genre || null,
      ideas: ideas || null,
    },
  });

  return NextResponse.json({ plan }, { status: 201 });
}

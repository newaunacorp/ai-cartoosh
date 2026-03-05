import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const sort = req.nextUrl.searchParams.get('sort') || 'recent'; // recent, trending, top

    let orderBy: any = { publishedAt: 'desc' };
    if (sort === 'trending') orderBy = { views: 'desc' };
    if (sort === 'top') orderBy = { likes: 'desc' };

    const postScripts = await prisma.postScript.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        avatar: { select: { id: true, name: true, avatarImage: true, voiceStyle: true } },
        user: { select: { id: true, displayName: true, profileImage: true } },
        contentPlan: { select: { planName: true, planType: true } },
        _count: { select: { interactions: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.postScript.count({ where: { status: 'PUBLISHED' } });

    return NextResponse.json({
      postScripts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to load feed' }, { status: 500 });
  }
}

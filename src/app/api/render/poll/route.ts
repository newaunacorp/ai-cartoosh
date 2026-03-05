import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { pollDIDTalkStatus, pollHeyGenVideo } from '@/lib/ai-services';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const jobId = req.nextUrl.searchParams.get('jobId');
    if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });

    const job = await prisma.renderJob.findUnique({ where: { id: jobId } });
    if (!job || job.userId !== user.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // If already completed or failed, return immediately
    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      return NextResponse.json({ job });
    }

    // Poll the appropriate provider
    let resultStatus: string;
    let resultUrl: string | undefined;
    let resultError: string | undefined;

    if (job.provider === 'HEYGEN') {
      // Poll HeyGen
      const result = await pollHeyGenVideo(job.providerJobId || '');
      resultStatus = result.status;
      resultUrl = result.videoUrl;
      resultError = result.error;

      // HeyGen uses 'completed' instead of 'done'
      if (resultStatus === 'completed' && resultUrl) {
        const updated = await prisma.renderJob.update({
          where: { id: jobId },
          data: { status: 'COMPLETED', resultVideoUrl: resultUrl, completedAt: new Date() },
        });
        await prisma.postScript.update({
          where: { id: job.postScriptId },
          data: { videoUrl: resultUrl, status: 'DRAFT' },
        });
        return NextResponse.json({ job: updated, provider: 'HEYGEN' });
      }
    } else {
      // Poll D-ID
      const result = await pollDIDTalkStatus(job.providerJobId || '');
      resultStatus = result.status;
      resultUrl = result.resultUrl;
      resultError = result.error;

      if (resultStatus === 'done' && resultUrl) {
        const updated = await prisma.renderJob.update({
          where: { id: jobId },
          data: { status: 'COMPLETED', resultVideoUrl: resultUrl, completedAt: new Date() },
        });
        await prisma.postScript.update({
          where: { id: job.postScriptId },
          data: { videoUrl: resultUrl, status: 'DRAFT' },
        });
        return NextResponse.json({ job: updated, provider: 'DID' });
      }
    }

    // Handle errors from either provider
    if (resultStatus === 'error' || resultStatus === 'failed') {
      const updated = await prisma.renderJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', errorMessage: resultError || 'Unknown error from provider' },
      });
      return NextResponse.json({ job: updated, provider: job.provider });
    }

    // Still processing
    return NextResponse.json({
      job: { ...job, status: 'PROCESSING' },
      provider: job.provider,
      providerStatus: resultStatus,
    });
  } catch (error: any) {
    console.error('Poll error:', error);
    return NextResponse.json({ error: 'Poll failed', details: error.message }, { status: 500 });
  }
}

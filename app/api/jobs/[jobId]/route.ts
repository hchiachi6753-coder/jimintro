import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/video/jobs';

export async function GET(_: NextRequest, { params }: { params: { jobId: string } }) {
  const job = await getJob(params.jobId);
  if (!job) {
    return NextResponse.json({ error: 'job not found' }, { status: 404 });
  }
  return NextResponse.json(job);
}

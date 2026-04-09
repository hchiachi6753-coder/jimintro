import fs from 'node:fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/video/jobs';

export async function GET(_: NextRequest, { params }: { params: { jobId: string } }) {
  const job = await getJob(params.jobId);
  if (!job?.mp4Path) return NextResponse.json({ error: 'not ready' }, { status: 404 });

  const file = await fs.readFile(job.mp4Path);
  return new NextResponse(file, {
    headers: {
      'content-type': 'video/mp4',
      'content-disposition': 'attachment; filename="lesson-recap.mp4"'
    }
  });
}

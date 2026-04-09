import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { ProcessRequest } from '@/lib/types';
import { getJob, saveJob } from '@/lib/video/jobs';
import { averageSampleSegments, parseManualSegments } from '@/lib/video/segments';
import { ensureStorageDirs, getStorageRoot, safeFileName } from '@/lib/video/storage';
import { probeVideo } from '@/lib/video/probeVideo';
import { extractSegments, muxAudio, renderVerticalVideo } from '@/lib/video/render';
import { zipOutput } from '@/lib/video/zipOutput';

export async function POST(request: NextRequest) {
  await ensureStorageDirs();
  const body = (await request.json()) as ProcessRequest;
  const jobId = uuid();

  const uploadPrefix = `${body.uploadId}_`;
  const uploadDir = path.join(getStorageRoot(), 'uploads');
  const files = await fs.readdir(uploadDir);
  const found = files.find((f) => f.startsWith(uploadPrefix));
  if (!found) {
    return NextResponse.json({ error: '找不到上傳檔案。' }, { status: 404 });
  }

  const inputPath = path.join(uploadDir, found);

  await saveJob({ id: jobId, status: 'processing' });

  try {
    const info = await probeVideo(inputPath);
    const manualSegments = parseManualSegments(body.segments || []);
    const segments = manualSegments.length > 0 ? manualSegments : averageSampleSegments(info.duration, body.outputLength);

    const tmpDir = path.join(getStorageRoot(), 'tmp', jobId);
    await fs.mkdir(tmpDir, { recursive: true });

    const segmentPaths = await extractSegments(inputPath, segments, tmpDir);

    const baseName = safeFileName(`${body.originalFilename.replace(/\.[^.]+$/, '')}-${jobId}`);
    const rawRender = path.join(getStorageRoot(), 'outputs', `${baseName}.raw.mp4`);
    const finalMp4 = path.join(getStorageRoot(), 'outputs', `${baseName}.mp4`);
    const zipPath = path.join(getStorageRoot(), 'outputs', `${baseName}.zip`);

    await renderVerticalVideo({
      segmentPaths,
      outputPath: rawRender,
      aspectRatio: body.aspectRatio,
      styleTemplate: body.styleTemplate,
      annotationDensity: body.annotationDensity,
      captionToggle: body.captionToggle
    });

    await muxAudio(rawRender, finalMp4, body.audioMode);
    await zipOutput(finalMp4, zipPath);

    await saveJob({
      id: jobId,
      status: 'done',
      mp4Path: finalMp4,
      zipPath,
      previewUrl: `/api/download/${jobId}/mp4`,
      downloadMp4Url: `/api/download/${jobId}/mp4`,
      downloadZipUrl: `/api/download/${jobId}/zip`
    });

    return NextResponse.json({ jobId });
  } catch (error) {
    const message = error instanceof Error ? error.message : '處理失敗';
    await saveJob({ id: jobId, status: 'failed', error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  const job = await getJob(jobId);
  if (!job) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(job);
}

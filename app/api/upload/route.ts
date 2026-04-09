import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { probeVideo } from '@/lib/video/probeVideo';
import { ensureStorageDirs, getStorageRoot, safeFileName } from '@/lib/video/storage';

export async function POST(request: NextRequest) {
  await ensureStorageDirs();
  const form = await request.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: '請選擇影片檔。' }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!['.mp4', '.mov'].includes(ext)) {
    return NextResponse.json({ error: '僅支援 mp4 / mov。' }, { status: 400 });
  }

  const id = uuid();
  const filename = `${id}_${safeFileName(file.name)}`;
  const fullPath = path.join(getStorageRoot(), 'uploads', filename);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(fullPath, Buffer.from(arrayBuffer));

  const info = await probeVideo(fullPath);

  return NextResponse.json({
    uploadId: id,
    storedFilename: filename,
    originalFilename: file.name,
    info
  });
}

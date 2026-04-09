import fs from 'node:fs/promises';
import path from 'node:path';
import { buildCaption } from '../config/captions';
import { AudioMode, StyleTemplate } from '../types';
import { runFfmpeg } from './ffmpeg';
import { Segment } from './segments';
import { formalTemplate } from '../templates/formalTemplate';
import { socialReelTemplate } from '../templates/socialReelTemplate';
import { warmCuteTemplate } from '../templates/warmCuteTemplate';

function pickTemplate(style: StyleTemplate) {
  if (style === 'formal') return formalTemplate();
  if (style === 'social') return socialReelTemplate();
  return warmCuteTemplate();
}

export async function extractSegments(inputPath: string, segments: Segment[], tmpDir: string) {
  const files: string[] = [];
  for (let i = 0; i < segments.length; i += 1) {
    const outPath = path.join(tmpDir, `segment_${i}.mp4`);
    const seg = segments[i];
    await runFfmpeg([
      '-y',
      '-ss',
      `${seg.startSec}`,
      '-i',
      inputPath,
      '-t',
      `${seg.durationSec}`,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '23',
      '-c:a',
      'aac',
      outPath
    ]);
    files.push(outPath);
  }
  return files;
}

export async function renderVerticalVideo(params: {
  segmentPaths: string[];
  outputPath: string;
  aspectRatio: '9:16' | '16:9';
  styleTemplate: StyleTemplate;
  annotationDensity: 'low' | 'medium' | 'high';
  captionToggle: 'on' | 'off';
}) {
  const { segmentPaths, outputPath, aspectRatio, styleTemplate, annotationDensity, captionToggle } = params;
  const template = pickTemplate(styleTemplate);
  const concatFile = `${outputPath}.concat.txt`;
  const target = aspectRatio === '9:16' ? { w: 1080, h: 1920 } : { w: 1920, h: 1080 };

  const drawTextFilters = segmentPaths.map((_, idx) => {
    if (captionToggle === 'off') return '';
    const yTop = Math.floor(target.h * 0.06);
    const yBottom = Math.floor(target.h * 0.84);
    const c = buildCaption(idx, annotationDensity);
    const enable = `between(t,${idx * 8},${(idx + 1) * 8})`;
    return [
      `drawtext=text='${c.title}':fontcolor=${template.textColor}:fontsize=42:x=(w-text_w)/2:y=${yTop}:enable='${enable}'`,
      `drawtext=text='${c.subtitle}':fontcolor=${template.textColor}:fontsize=30:x=(w-text_w)/2:y=${yTop + 52}:enable='${enable}'`,
      `drawtext=text='${c.note}':fontcolor=${template.textColor}:fontsize=32:x=(w-text_w)/2:y=${yBottom}:enable='${enable}'`
    ].join(',');
  });

  await fs.writeFile(concatFile, segmentPaths.map((f) => `file '${f}'`).join('\n'));

  const filter = [
    `scale=${target.w}:${target.h}:force_original_aspect_ratio=decrease`,
    `pad=${target.w}:${target.h}:(ow-iw)/2:(oh-ih)/2:color=${template.bgColor}`,
    `boxblur=4:1`,
    ...drawTextFilters.filter(Boolean)
  ].join(',');

  await runFfmpeg([
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    concatFile,
    '-vf',
    filter,
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    outputPath
  ]);

  await fs.unlink(concatFile);
}

export async function muxAudio(videoPath: string, outPath: string, audioMode: AudioMode) {
  if (audioMode === 'mute') {
    await runFfmpeg(['-y', '-i', videoPath, '-c:v', 'copy', '-an', outPath]);
    return;
  }

  if (audioMode === 'original') {
    await runFfmpeg(['-y', '-i', videoPath, '-c:v', 'copy', '-c:a', 'aac', outPath]);
    return;
  }

  await runFfmpeg([
    '-y',
    '-i',
    videoPath,
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=440:duration=9999',
    '-filter_complex',
    '[0:a]volume=1[a0];[1:a]volume=0.08[a1];[a0][a1]amix=inputs=2:duration=shortest[aout]',
    '-map',
    '0:v:0',
    '-map',
    '[aout]',
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    outPath
  ]);
}

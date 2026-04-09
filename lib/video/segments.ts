import { SegmentInput } from '../types';

function toSeconds(t: string) {
  const [mm, ss] = t.split(':').map(Number);
  if (Number.isNaN(mm) || Number.isNaN(ss)) throw new Error(`時間格式錯誤：${t}`);
  return mm * 60 + ss;
}

export interface Segment {
  startSec: number;
  durationSec: number;
}

export function parseManualSegments(inputs: SegmentInput[]): Segment[] {
  return inputs
    .filter((s) => s.start && s.end)
    .map((segment) => {
      const startSec = toSeconds(segment.start);
      const endSec = toSeconds(segment.end);
      if (endSec <= startSec) throw new Error('片段結束時間必須晚於開始時間');
      return { startSec, durationSec: endSec - startSec };
    });
}

export function averageSampleSegments(totalDuration: number, outputLength: number, pieces = 3): Segment[] {
  const clipDur = Math.max(6, Math.floor(outputLength / pieces));
  const stride = Math.max(clipDur, (totalDuration - clipDur) / Math.max(1, pieces - 1));
  const segments: Segment[] = [];
  for (let i = 0; i < pieces; i += 1) {
    const startSec = Math.max(0, Math.floor(i * stride));
    segments.push({ startSec, durationSec: clipDur });
  }
  return segments;
}

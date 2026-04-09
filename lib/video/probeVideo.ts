import { runFfprobe } from './ffmpeg';
import { VideoInfo } from '../types';

interface FFProbeResult {
  streams: Array<{ codec_type: string; width?: number; height?: number }>;
  format: { duration?: string };
}

export async function probeVideo(filePath: string): Promise<VideoInfo> {
  const raw = await runFfprobe(['-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', filePath]);
  const parsed = JSON.parse(raw) as FFProbeResult;
  const videoStream = parsed.streams.find((s) => s.codec_type === 'video');
  const hasAudio = parsed.streams.some((s) => s.codec_type === 'audio');

  if (!videoStream) {
    throw new Error('無法讀取影片串流。');
  }

  return {
    duration: Number(parsed.format.duration || 0),
    width: videoStream.width || 0,
    height: videoStream.height || 0,
    hasAudio
  };
}

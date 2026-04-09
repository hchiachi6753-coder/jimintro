export type AspectRatio = '9:16' | '16:9';
export type OutputLength = 30 | 45 | 60;
export type StyleTemplate = 'warmCute' | 'formal' | 'social';
export type AnnotationDensity = 'low' | 'medium' | 'high';
export type CaptionToggle = 'on' | 'off';
export type AudioMode = 'original' | 'original_with_bgm' | 'mute';

export interface SegmentInput {
  start: string;
  end: string;
}

export interface VideoInfo {
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
}

export interface ProcessRequest {
  uploadId: string;
  originalFilename: string;
  aspectRatio: AspectRatio;
  outputLength: OutputLength;
  styleTemplate: StyleTemplate;
  annotationDensity: AnnotationDensity;
  captionToggle: CaptionToggle;
  audioMode: AudioMode;
  segments: SegmentInput[];
}

export interface JobRecord {
  id: string;
  status: 'processing' | 'done' | 'failed';
  error?: string;
  mp4Path?: string;
  zipPath?: string;
  previewUrl?: string;
  downloadMp4Url?: string;
  downloadZipUrl?: string;
}

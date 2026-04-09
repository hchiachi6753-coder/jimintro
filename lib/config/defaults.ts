import { ProcessRequest } from '../types';

export const defaultProcessSettings: Omit<ProcessRequest, 'uploadId' | 'originalFilename' | 'segments'> = {
  aspectRatio: '9:16',
  outputLength: 45,
  styleTemplate: 'warmCute',
  annotationDensity: 'medium',
  captionToggle: 'on',
  audioMode: 'original'
};

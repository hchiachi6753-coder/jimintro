import { StyleTemplate } from '../types';

export interface TemplateStyle {
  bgColor: string;
  cardColor: string;
  textColor: string;
  shadow: string;
}

export const styleConfig: Record<StyleTemplate, TemplateStyle> = {
  warmCute: {
    bgColor: '#fff7ed',
    cardColor: '#ffffffcc',
    textColor: '#334155',
    shadow: '0x00000022'
  },
  formal: {
    bgColor: '#f8fafc',
    cardColor: '#ffffffdd',
    textColor: '#0f172a',
    shadow: '0x00000025'
  },
  social: {
    bgColor: '#f5f3ff',
    cardColor: '#ffffffd0',
    textColor: '#1e1b4b',
    shadow: '0x00000030'
  }
};

export const sectionTitleCandidates = [
  '今日主題',
  '單字練習',
  '句型理解',
  '互動反應',
  '聽力辨識',
  '課堂收尾'
];

export const parentNoteTemplates = [
  '孩子跟著老師一起進入今天的學習主題。',
  '透過畫面與互動，練習理解英文內容。',
  '這段可以看到孩子持續參與課程節奏。',
  '透過反覆練習，幫助孩子自然熟悉內容。',
  '最後用輕鬆的方式完成今天的學習。'
];

export function buildCaption(index: number, density: 'low' | 'medium' | 'high') {
  const title = sectionTitleCandidates[index % sectionTitleCandidates.length];
  const subtitle = `第 ${index + 1} 段學習回顧`;
  const note = parentNoteTemplates[(index + (density === 'high' ? 2 : 0)) % parentNoteTemplates.length];
  return { title, subtitle, note };
}

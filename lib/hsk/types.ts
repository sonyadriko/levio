export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface VocabWord {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  hsk: HskLevel;
  example?: string;
  examplePinyin?: string;
  exampleMeaning?: string;
}

export interface HskLevelMeta {
  level: HskLevel;
  name: string;
  description: string;
}

import { Quad } from 'core/type';

import { READ_ALOUD_SERVICES } from '../constants';

export interface ICommonVoice {
  name: string;
  value: string;
  language: string;
  isDefault: boolean;
  serviceType: typeof READ_ALOUD_SERVICES[keyof typeof READ_ALOUD_SERVICES];
}

export interface ILanguageOption {
  label: string;
  value: string;
}
export interface IReadAloudActionsProps {
  activeVoice: ICommonVoice;
  documentTextByPages: string[];
}

export interface ReadAloudState {
  isInReadAloudMode: boolean;
  isNoTextModalOpen: boolean;
  speakingSettings: {
    activeLanguage: string;
    activeVoice: ICommonVoice;
    rate: number;
    pitch: number;
  };
  isReadingSample: boolean;
  isReadingDocument: boolean;
  isCompletedReadDocument: boolean;
  isReadAloudModeReady: boolean;
}

export type WordInfo = {
  word: string;
  startIndex: number;
  endIndex: number;
  sentenceIndex: number;
};

export type PotentialMatch = {
  quad: SelectedQuad;
  wordInfo: WordInfo;
};

export type SelectedQuad = Pick<Quad, 'x1' | 'y1' | 'x4' | 'y4'>;

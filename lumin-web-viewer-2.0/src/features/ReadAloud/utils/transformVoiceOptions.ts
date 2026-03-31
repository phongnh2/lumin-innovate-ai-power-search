import { ICommonVoice } from '../interfaces';

export const transformVoiceOptions = (listVoices: ICommonVoice[]) =>
  listVoices.map((voice: ICommonVoice) => ({
    label: voice.name,
    value: voice.value,
  }));

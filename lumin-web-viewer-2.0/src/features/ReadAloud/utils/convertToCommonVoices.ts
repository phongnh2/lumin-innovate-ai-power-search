import { READ_ALOUD_SERVICES } from '../constants';
import { ICommonVoice } from '../interfaces';

export const convertToCommonVoices = (voices: SpeechSynthesisVoice[]) => {
  const commonVoices: ICommonVoice[] = [];
  voices.forEach((voice: SpeechSynthesisVoice) => {
    if (voice instanceof window.SpeechSynthesisVoice) {
      commonVoices.push({
        name: voice.name,
        value: voice.name,
        language: voice.lang,
        isDefault: voice.default,
        serviceType: READ_ALOUD_SERVICES.WEB_API,
      });
    }
    // TODO: Google Speech API
  });
  return commonVoices;
};

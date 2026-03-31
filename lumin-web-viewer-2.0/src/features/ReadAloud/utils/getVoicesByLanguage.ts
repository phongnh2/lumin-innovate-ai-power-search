import { ICommonVoice } from '../interfaces';

interface IProps {
  language: string;
  voices: ICommonVoice[];
}
export const getVoicesByLanguage = (props: IProps) => {
  const { language, voices } = props;
  const listVoicesByLanguage: ICommonVoice[] = [];
  voices.forEach((voice) => {
    if (voice.language === language) {
      listVoicesByLanguage.push(voice);
    }
  });
  return listVoicesByLanguage;
};

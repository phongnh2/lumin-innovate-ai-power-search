import { TFunction } from 'react-i18next';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

import { ICommonVoice, ILanguageOption } from '../interfaces';

const displayNames = new Intl.DisplayNames(['en'], { type: 'language', style: 'short' });

const getBCP47Regex = () => {
  const language = '(?:[a-zA-Z]{2,3}|[a-zA-Z]{5,8})';
  const script = '(?:-[a-zA-Z]{4})';
  const region = '(?:-(?:[a-zA-Z]{2}|\\d{3}))';
  const variant = '(?:-(?:[a-zA-Z\\d]{5,8}|\\d[a-zA-Z\\d]{3}))*';
  const extension = '(?:-[a-wyzA-WYZ](?:-[\\da-zA-Z]{2,8})+)*';
  const privateUse = '(?:-x(?:-[\\da-zA-Z]{1,8})+)?';

  return new RegExp(`^${language}${script}?${region}?${variant}${extension}${privateUse}$`);
};

export const getLanguages = ({ voices, t }: { voices: ICommonVoice[]; t: TFunction }): ILanguageOption[] => {
  const uniqueLanguages = new Map<string, ILanguageOption>();

  voices.forEach((item: ICommonVoice) => {
    try {
      const regex = getBCP47Regex();
      if (!item.language?.[0]) {
        return;
      }
      const code = regex.exec(item.language)[0];

      if (code && !uniqueLanguages.has(code)) {
        const label = displayNames.of(code);
        uniqueLanguages.set(code, {
          value: code,
          label: label ?? t('viewer.readAloud.unknownLanguage'),
        });
      }
    } catch (error: unknown) {
      logger.logError({ reason: LOGGER.Service.READ_ALOUD, error });
    }
  });

  return Array.from(uniqueLanguages.values()).sort((a, b) => a.label.localeCompare(b.label));
};

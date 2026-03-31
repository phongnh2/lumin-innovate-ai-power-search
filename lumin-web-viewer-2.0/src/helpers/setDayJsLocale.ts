import dayjs from 'dayjs';

import { getLanguage } from 'utils/getLanguage';

import { LANGUAGES } from 'constants/language';

import logger from './logger';

export const setDayJsLocale = async (): Promise<void> => {
  const language = getLanguage() as LANGUAGES;

  try {
    switch (language) {
      case LANGUAGES.FR:
        await import('dayjs/locale/fr');
        break;
      case LANGUAGES.ES:
        await import('dayjs/locale/es');
        break;
      case LANGUAGES.VI:
        await import('dayjs/locale/vi');
        break;
      case LANGUAGES.PT:
        await import('dayjs/locale/pt');
        break;
      case LANGUAGES.EN:
        await import('dayjs/locale/en');
        break;
      default:
        logger.logError({
          message: `Unsupported language: ${language as string}`,
          attributes: { language },
        });
        return;
    }

    dayjs.locale(language);
  } catch (e) {
    logger.logError({
      message: `Can't import dayjs locale for ${language}`,
      attributes: { language },
      error: e,
    });
  }
};

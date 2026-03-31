import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { loggerServices } from 'services';

import { getLanguage } from 'utils/getLanguage';

import { LANGUAGES, LANGUAGE_TEXT, PLURAL_CATEGORY } from 'constants/language';

import terms from '../../i18n/terms.json';

type TResponse = {
  default: Record<string, string>;
};

type TPluralSuffixOptions = {
  ordinal?: boolean;
  [key: string]: unknown;
};

type TPluralResolver = {
  getSuffix: (lng: string, count: number, options?: TPluralSuffixOptions) => string;
  [key: string]: unknown;
};

type TPluralGetSuffixFn = (lng: string, count: number, options?: TPluralSuffixOptions) => string;

const language = getLanguage() as LANGUAGES;

import(`../../i18n/translation-${language}.json`)
  .then(async (response: TResponse) => {
    const { default: logger } = await import('helpers/logger');
    i18n
      .use(initReactI18next)
      .init({
        lng: language,
        compatibilityJSON: 'v4',
        interpolation: {
          escapeValue: false,
        },
        resources: { [language]: { translation: response.default, terms } },
        saveMissing: true,
      })
      .then(() => {
        const pluralResolver = i18n.services.pluralResolver as TPluralResolver | undefined;

        if (pluralResolver) {
          const originalGetSuffix: TPluralGetSuffixFn = pluralResolver.getSuffix.bind(
            pluralResolver
          ) as TPluralGetSuffixFn;
          pluralResolver.getSuffix = function getVietnamesePluralSuffix(
            lng: string,
            count: number,
            options: TPluralSuffixOptions = {}
          ): string {
            if (lng === LANGUAGES.VI) {
              const pluralCategory = count === 1 ? PLURAL_CATEGORY.ONE : PLURAL_CATEGORY.OTHER;
              return `_${pluralCategory}`;
            }
            return originalGetSuffix(lng, count, options);
          };
        }
      })
      .catch(() => {
        logger.logError({ message: "Can't init i18n" });
      });

    i18n.on('missingKey', (lngs, namespace, key) => {
      const languageText = LANGUAGE_TEXT[language.toUpperCase() as keyof typeof LANGUAGE_TEXT];
      logger.logError({
        message: `Missing translation key in ${languageText}: ${key}`,
      });
    });
  })
  .catch(() => {
    /**
     * Don't replace this with logger.logError
     * because it will cause a circular dependency
     */
    loggerServices.error({
      message: `Can't import translation-${language}.json file`,
    });
  });

export default i18n;

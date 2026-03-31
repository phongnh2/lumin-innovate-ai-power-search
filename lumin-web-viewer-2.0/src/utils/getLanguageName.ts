import { shouldPolyfill as shouldPolyfillIntlDisplayNames } from '@formatjs/intl-displaynames/should-polyfill';
import { shouldPolyfill as shouldPolyfillIntlGetcanonicallocales } from '@formatjs/intl-getcanonicallocales/should-polyfill';
import { shouldPolyfill as shouldPolyfillIntlLocale } from '@formatjs/intl-locale/should-polyfill';

const getLanguageName = async (language: string): Promise<string> => {
  if (shouldPolyfillIntlDisplayNames('en')) {
    if (shouldPolyfillIntlLocale()) {
      if (shouldPolyfillIntlGetcanonicallocales()) {
        await import('@formatjs/intl-getcanonicallocales/polyfill');
      }
      await import('@formatjs/intl-locale/polyfill');
    }
    await import('@formatjs/intl-displaynames/polyfill-force');
    await import('@formatjs/intl-displaynames/locale-data/en');
  }

  const languageNameInEnglish = new Intl.DisplayNames(['en'], { type: 'language' });

  return languageNameInEnglish.of(language);
};

export default getLanguageName;

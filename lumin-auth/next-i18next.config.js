// @ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ['en', 'vi', 'fr', 'pt', 'es'],
    defaultLocale: 'en'
  },
  ns: ['common', 'terms'],
  defaultNS: 'common',
  fallbackLng: {
    default: ['en']
  },
  saveMissing: true,
  serializeConfig: false,
  missingKeyHandler: (lng, ns, key, fallbackValue) => {
    console.error(`Missing translation key [${key}] for [${lng}/${ns}], fallbackValue: ${fallbackValue}`);
    return { props: { key: key } };
  },
  localePath: (locale, namespace) => {
    if (namespace === 'terms') {
      return path.resolve('./public/locales', `${namespace}.json`);
    }
    return path.resolve('./public/locales', locale, `${namespace}.json`);
  }
};

import { useTranslation as useTranslationI18n } from 'next-i18next';

const useTranslation = (namespaces: string[] = []) => {
  return useTranslationI18n(!namespaces.length ? 'common' : ['common', ...namespaces]);
};

export default useTranslation;

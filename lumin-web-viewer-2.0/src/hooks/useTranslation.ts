import { useMemo } from 'react';
import { useTranslation as useTranslationI18 } from 'react-i18next';

export const useTranslation = () => {
  const { t } = useTranslationI18();

  return useMemo(() => ({ t }), [t]);
};

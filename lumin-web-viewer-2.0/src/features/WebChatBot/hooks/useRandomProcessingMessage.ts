import { useEffect, useState } from 'react';

import { useTranslation } from 'hooks/useTranslation';

/**
 * Hook that returns a random processing message from translations
 * @returns A random processing message
 */
export const useRandomProcessingMessage = (deps: unknown[]): string => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(1);

  useEffect(() => {
    const random = Math.floor(Math.random() * 4) + 1;
    setIndex(random);
  }, [...deps]);

  if (index === 0) {
    return '';
  }

  return t(`viewer.chatbot.processingMessage${index}`);
};

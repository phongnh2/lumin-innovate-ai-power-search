import { ButtonSize, IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import { motion, AnimatePresence } from 'motion/react';
import React, { useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { useTranslation } from 'hooks/useTranslation';

import { executeCopy } from 'utils/executeCopy';

import { CopyButtonType, RESET_COPY_STATUS_TIME } from './constants';

interface CopyButtonProps {
  dataCy: string;
  size: ButtonSize;
  type: CopyButtonType;
  contentRef?: HTMLDivElement;
  textContent?: string;
}

const getCopyIcon = ({ type, isCopied }: { type: CopyButtonType; isCopied: boolean }) => {
  if (isCopied) {
    return 'circle-check-filled-md';
  }
  switch (type) {
    case CopyButtonType.DEFAULT:
      return 'ph-copy';
    case CopyButtonType.SIMPLE:
      return 'ph-copy-simple';
    default:
      return 'ph-copy';
  }
};

const CopyButton = ({ dataCy, type, size, contentRef, textContent }: CopyButtonProps) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const icon = useMemo(() => getCopyIcon({ type, isCopied }), [type, isCopied]);

  const debounceResetCopyStatus = useDebouncedCallback(() => setIsCopied(false), RESET_COPY_STATUS_TIME);

  const onCopy = async () => {
    debounceResetCopyStatus.cancel();
    if (contentRef || textContent) {
      await executeCopy({
        textHtml: contentRef?.outerHTML || textContent,
        textPlain: contentRef?.innerText || textContent,
      });
    }
    setIsCopied(true);
    debounceResetCopyStatus();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={isCopied ? 'copied' : 'copy'}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <PlainTooltip content={isCopied ? t('common.copied') : t('common.copy')}>
          <IconButton data-cy={dataCy} icon={icon} size={size} onClick={onCopy} />
        </PlainTooltip>
      </motion.span>
    </AnimatePresence>
  );
};

export default CopyButton;

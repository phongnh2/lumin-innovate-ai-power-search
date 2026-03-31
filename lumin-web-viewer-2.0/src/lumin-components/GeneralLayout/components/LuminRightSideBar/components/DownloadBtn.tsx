import { IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { TriggerDownloadDocumentSource } from 'luminComponents/SaveAsModal/constant';

import useDocumentTools from 'hooks/useDocumentTools';
import { useTranslation } from 'hooks/useTranslation';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import toolsName from 'constants/toolsName';

type DownloadBtnProps = {
  toolValidateCallback: () => boolean;
  disabled?: boolean;
  tooltipContent?: string;
};

const DownloadBtn = ({ toolValidateCallback, disabled = false, tooltipContent }: DownloadBtnProps) => {
  const { t } = useTranslation();
  const { handleDownloadDocument } = useDocumentTools();

  const onBtnClick = () => {
    if (toolValidateCallback()) {
      handlePromptCallback({
        callback: handleDownloadDocument({
          source: TriggerDownloadDocumentSource.RIGHT_SIDE_BAR_BUTTON,
        }),
        applyForTool: toolsName.REDACTION,
      })();
    }
  };

  return (
    <PlainTooltip content={tooltipContent || t('common.download')} position="left">
      <IconButton icon="ph-download-simple" size="lg" onClick={onBtnClick} disabled={disabled} />
    </PlainTooltip>
  );
};

export default DownloadBtn;

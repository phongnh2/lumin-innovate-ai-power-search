import { Icomoon, IconButton, IconSize, MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import useDocumentTools from 'hooks/useDocumentTools';
import { useTranslation } from 'hooks/useTranslation';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import toolsName from 'constants/toolsName';

type PrintBtnProps = {
  toolValidateCallback: () => boolean;
  renderAsMenuItem?: boolean;
  disabled?: boolean;
  tooltipContent?: string;
};

const PrintBtn = ({
  toolValidateCallback,
  renderAsMenuItem = false,
  disabled = false,
  tooltipContent,
}: PrintBtnProps) => {
  const { t } = useTranslation();

  const { handlePrintDocument } = useDocumentTools();

  const onBtnClick = () => {
    if (toolValidateCallback()) {
      handlePromptCallback({
        callback: handlePrintDocument({ inRightSideBar: true }),
        applyForTool: toolsName.REDACTION,
      })();
    }
  };

  if (renderAsMenuItem) {
    return (
      <PlainTooltip content={tooltipContent} position="left">
        <MenuItem
          key="print"
          data-cy="print_button"
          onClick={onBtnClick}
          leftSection={<Icomoon type="ph-printer" size={IconSize.lg} color="--kiwi-colors-surface-on-surface" />}
          disabled={disabled}
        >
          {t('common.print')}
        </MenuItem>
      </PlainTooltip>
    );
  }

  return (
    <PlainTooltip content={tooltipContent || t('common.print')} position="left">
      <IconButton icon="ph-printer" size="lg" onClick={onBtnClick} data-cy="print_button" disabled={disabled} />
    </PlainTooltip>
  );
};

export default PrintBtn;

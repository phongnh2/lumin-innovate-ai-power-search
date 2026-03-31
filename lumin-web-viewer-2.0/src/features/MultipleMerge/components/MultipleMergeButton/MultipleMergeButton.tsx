import {
  PlainTooltip as KiwiTooltip,
  Button as KiwiButton,
  Icomoon as KiwiIcomoon,
  IconButton,
} from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useBulkActionIconButton } from 'features/WebChatBot/hooks/useBulkActionIconButton';

import { useEnabledMultipleMerge } from '../../hooks/useEnabledMultipleMerge';

type Props = {
  tooltipContent?: string;
  disabled?: boolean;
  disableTooltipInteractive?: boolean;
  onMergeDocuments?: () => void;
};

const MultipleMergeIcon = ({ disabled }: { disabled: boolean }) => (
  <KiwiIcomoon
    size="md"
    type="merge-md"
    color={disabled ? 'var(--kiwi-colors-custom-role-web-surface-var-background)' : 'var(--kiwi-colors-core-secondary)'}
  />
);

const MultipleMergeButton = ({
  tooltipContent = '',
  disabled = false,
  disableTooltipInteractive = false,
  onMergeDocuments = () => {},
}: Props) => {
  const { t } = useTranslation();
  const { enabled } = useEnabledMultipleMerge();
  const isBulkActionIconButton = useBulkActionIconButton();

  if (!enabled) {
    return null;
  }

  const renderButton = () => {
    if (isBulkActionIconButton) {
      return (
        <IconButton
          disabled={disabled}
          icon={<MultipleMergeIcon disabled={disabled} />}
          onClick={onMergeDocuments}
          variant="elevated"
          data-cy="merge_button"
          data-lumin-btn-name={ButtonName.MERGE}
          className="kiwi-button--elevated-without-shadow"
        />
      );
    }
    return (
      <KiwiButton
        variant="elevated"
        disabled={disabled}
        onClick={onMergeDocuments}
        startIcon={<MultipleMergeIcon disabled={disabled} />}
        data-cy="merge_button"
        data-lumin-btn-name={ButtonName.MERGE}
        className="kiwi-button--elevated-without-shadow"
      >
        {t('action.merge')}
      </KiwiButton>
    );
  };

  return (
    <KiwiTooltip maw={224} content={tooltipContent} disabled={disableTooltipInteractive} position="top">
      <span>{renderButton()}</span>
    </KiwiTooltip>
  );
};

export default MultipleMergeButton;

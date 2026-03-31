import { Icomoon, IconSize, MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useOpenRevisionMode } from 'features/DocumentRevision/hooks/useOpenRevisionMode';

const VersionHistory = () => {
  const { t } = useTranslation();
  const { shouldHideVersionHistoryInViewerMenu, onOpenDocumentRevisionMode } = useOpenRevisionMode();

  return (
    <MenuItem
      leftSection={
        <Icomoon type="ph-clock-counter-clockwise" size={IconSize.lg} color="--kiwi-colors-surface-on-surface" />
      }
      data-lumin-btn-name={ButtonName.VIEW_ORIGINAL_VERSION}
      onClick={onOpenDocumentRevisionMode}
      disabled={shouldHideVersionHistoryInViewerMenu}
    >
      {t('viewer.viewRevisionTooltip')}
    </MenuItem>
  );
};

export default VersionHistory;

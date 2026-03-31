import React from 'react';

import { RichTooltip } from '@new-ui/general-components/Tooltip';

import Icomoon from 'lumin-components/Icomoon';

import { useNetworkStatus } from 'hooks/useNetworkStatus';
import { useTranslation } from 'hooks/useTranslation';

const OfflineStatusIcon = () => {
  const { isOnline } = useNetworkStatus();
  const { t } = useTranslation();
  if (isOnline) {
    return null;
  }
  return (
    <RichTooltip
      title={t('viewer.header.offlineStatus.title')}
      content={t('viewer.header.offlineStatus.description')}
      tooltipStyle={{
        width: 260,
      }}
    >
      <Icomoon className="md_offline_access" size={20} />
    </RichTooltip>
  );
};

export default OfflineStatusIcon;

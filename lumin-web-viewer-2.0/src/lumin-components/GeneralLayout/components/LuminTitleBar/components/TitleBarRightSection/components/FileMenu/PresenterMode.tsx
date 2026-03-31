import { Badge, MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { getShortcut } from '@new-ui/components/LuminToolbar/utils';

import { useTranslation } from 'hooks/useTranslation';

import { togglePresenterMode } from 'features/FullScreen/helpers/togglePresenterMode';

import styles from './FileMenu.module.scss';

const PresenterMode = () => {
  const { t } = useTranslation();

  return (
    <MenuItem
      leftIconProps={{
        type: 'monitor-play',
        size: 'lg',
      }}
      rightSection={<span className={styles.shortKey}>{getShortcut('fullScreen')}</span>}
      onClick={togglePresenterMode}
    >
      {t('action.presenterMode')}{' '}
      <Badge size="sm" variant="blue">
        BETA
      </Badge>
    </MenuItem>
  );
};

export default PresenterMode;

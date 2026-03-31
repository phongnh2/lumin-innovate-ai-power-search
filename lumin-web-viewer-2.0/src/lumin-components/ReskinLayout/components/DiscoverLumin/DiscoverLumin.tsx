import { Divider, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Logo from 'assets/lumin-svgs/logo-lumin.svg';
import DiscoverLuminImage from 'assets/reskin/lumin-svgs/discover-lumin.svg';

import { useTranslation } from 'hooks';

import styles from './DiscoverLumin.module.scss';

const DiscoverLumin = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <img src={Logo} alt="Lumin Logo" style={{}}/>
      </div>
      <Divider color="var(--kiwi-colors-surface-outline-variant)" w="100%" />
      <div className={styles.container}>
        <img src={DiscoverLuminImage} alt="Discover Lumin" />
        <Text type="headline" size="sm" color="var(--kiwi-colors-surface-on-surface)">
          {t('discoverLumin.title')}
        </Text>
      </div>
    </div>
  );
};

export default DiscoverLumin;

import { IconButton, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { useTranslation } from 'hooks';

import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { AWS_EVENTS } from 'constants/awsEvents';

import styles from '../../MainSidebar.module.scss';

const Home = ({ to }: { to: string }) => {
  const { t } = useTranslation();
  return (
    <NavLink tabIndex={-1} to={to}>
      {({ isActive }) => (
        <div className={styles.navigationContainer} data-active={isActive}>
          <div className={styles.iconButtonContainer}>
            <IconButton
              icon="smart-home-lg"
              size="lg"
              activatedProps={{ bg: 'var(--kiwi-colors-surface-surface-container)' }}
              data-cy="navigation_home"
              data-lumin-btn-name={NavigationNames.HOME}
              data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
              activated={isActive}
            />
          </div>
          <Text size="sm" type="label">
            {t('common.home')}
          </Text>
        </div>
      )}
    </NavLink>
  );
};
export default Home;

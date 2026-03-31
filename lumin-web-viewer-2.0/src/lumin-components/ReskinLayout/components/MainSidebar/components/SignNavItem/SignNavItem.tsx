import classNames from 'classnames';
import { IconButton, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { usePersonalWorkspaceLocation, useTranslation } from 'hooks';

import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { AWS_EVENTS } from 'constants/awsEvents';

import styles from '../../MainSidebar.module.scss';

type Props = {
  orgLink?: string;
};

const SignNavItem = ({ orgLink }: Props) => {
  const { t } = useTranslation();

  const isAtPersonalWorkspace = usePersonalWorkspaceLocation();

  return (
    !isAtPersonalWorkspace && (
      <NavLink tabIndex={-1} to={`${orgLink}/sign`}>
        {({ isActive }) => (
          <div
            data-active={isActive}
            className={classNames(styles.navigationContainer, isActive ? styles.activeEdit : undefined)}
          >
            <div className={styles.iconButtonContainer}>
              <IconButton
                icon="logo-sign-lg"
                size="lg"
                activatedProps={{
                  bg: 'var(--kiwi-colors-core-tertiary-container)',
                  color: 'var(--kiwi-colors-core-on-tertiary-container)',
                }}
                activated={isActive}
                data-cy="navigation_sign"
                data-lumin-btn-name={NavigationNames.CONTRACTS}
                data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
              />
            </div>
            <Text size="sm" type="label">
              {t('action.sign')}
            </Text>
          </div>
        )}
      </NavLink>
    )
  );
};

export default SignNavItem;

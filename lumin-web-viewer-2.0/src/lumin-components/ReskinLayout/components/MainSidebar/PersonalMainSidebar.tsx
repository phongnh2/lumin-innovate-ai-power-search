import classNames from 'classnames';
import { IconButton, Text, Divider } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import selectors from 'selectors';

import { useAvailablePersonalWorkspace, useTranslation } from 'hooks';

import { avatar } from 'utils';
import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { AWS_EVENTS } from 'constants/awsEvents';

import { IUser } from 'interfaces/user/user.interface';

import { WorkspaceAvatar, SignNavItem, AgreementGenNavItem } from './components';
import MainNavigationSkeleton from './MainNavigationSkeleton';

import styles from './MainSidebar.module.scss';

const PersonalMainSidebar = () => {
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const isOffline = useSelector<unknown, boolean>(selectors.isOffline);

  const { name, avatarRemoteId } = currentUser || {};
  const isAvailable = useAvailablePersonalWorkspace();
  const loading = !isAvailable && !isOffline;

  const { t } = useTranslation();

  if (loading) {
    return <MainNavigationSkeleton />;
  }

  return (
    <div className={styles.container}>
      <WorkspaceAvatar src={avatar.getAvatar(avatarRemoteId)} alt={name} />
      <div className={styles.dividerWrapper}>
        <Divider />
      </div>
      <AgreementGenNavItem />
      <NavLink tabIndex={-1} to="/documents">
        {({ isActive }) => (
          <div data-active={isActive} className={classNames(styles.navigationContainer, isActive && styles.activeEdit)}>
            <div className={styles.iconButtonContainer}>
              <IconButton
                icon="lm-file-edit"
                size="lg"
                activatedProps={{ bg: 'var(--kiwi-colors-custom-role-web-surface-blue-activated)' }}
                activated={isActive}
                data-cy="navigation_documents"
                data-lumin-btn-name={NavigationNames.DOCS}
                data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
              />
            </div>
            <Text size="sm" type="label">
              {t('common.documents')}
            </Text>
          </div>
        )}
      </NavLink>
      <SignNavItem />
      <NavLink tabIndex={-1} to="/webopt">
        {({ isActive }) => (
          <div data-active={isActive} className={classNames(styles.navigationContainer, isActive && styles.activeEdit)}>
            <div className={styles.iconButtonContainer}>
              <IconButton
                icon="ph-globe"
                size="lg"
                activatedProps={{ bg: "var(--kiwi-colors-core-primary-container)" }}
                activated={isActive}
                data-cy="navigation_discover"
              />
            </div>
            <Text size="sm" type="label">
              Discover
            </Text>
          </div>
        )}
      </NavLink>
    </div>
  );
};

export default PersonalMainSidebar;

import classNames from 'classnames';
import { Divider, IconButton, Text } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import selectors from 'selectors';

import AddMemberOrganizationModal from 'luminComponents/AddMemberOrganizationModal';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { avatar } from 'utils';
import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { AWS_EVENTS } from 'constants/awsEvents';
import { InviteUsersSetting } from 'constants/organization.enum';
import { ORG_TEXT } from 'constants/organizationConstants';

import { IOrganizationData } from 'interfaces/redux/organization.redux.interface';

import { WorkspaceAvatar, SignNavItem, Home, AgreementGenNavItem, TemplateNavItem } from './components';
import MainNavigationSkeleton from './MainNavigationSkeleton';

import styles from './MainSidebar.module.scss';

type AddMemberModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  updateCurrentOrganization: (data?: unknown) => void;
};
const AddMemberModal = AddMemberOrganizationModal as React.ComponentType<AddMemberModalProps>;

const OrgMainSidebar = () => {
  const { t } = useTranslation();
  const [isOpenAddMemberModal, setOpenAddMemberModal] = useState(false);

  const { data: currentOrganization, loading } =
    useSelector<unknown, IOrganizationData>(selectors.getCurrentOrganization, shallowEqual) || {};

  if (loading) {
    return <MainNavigationSkeleton />;
  }

  const { name, avatarRemoteId } = currentOrganization || {};
  const isManager = organizationServices.isManager(currentOrganization?.userRole);
  const showInviteButton =
    !loading &&
    (isManager || currentOrganization?.settings?.inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE);
  const orgLink = `/${ORG_TEXT}/${currentOrganization?.url}`;

  return (
    <div className={styles.container}>
      <div className={showInviteButton && styles.workspaceWrapper}>
        <WorkspaceAvatar src={avatar.getAvatar(avatarRemoteId)} alt={name} />
        {showInviteButton && (
          <div tabIndex={-1} className={classNames(styles.navigationContainer)}>
            <IconButton
              icon="user-plus-lg"
              size="lg"
              onClick={() => {
                setOpenAddMemberModal((prev) => !prev);
              }}
              data-cy="navigation_invite"
              data-lumin-btn-name={NavigationNames.INVITE_WORKSPACE_MEMBER}
              data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
            />
          </div>
        )}
      </div>
      <Home to={`${orgLink}/home`} />
      <div className={styles.dividerWrapper}>
        <Divider />
      </div>
      <NavLink tabIndex={-1} to={`${orgLink}/documents`}>
        {({ isActive }) => (
          <div
            data-active={isActive}
            className={classNames(styles.navigationContainer, isActive ? styles.activeEdit : undefined)}
          >
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
      <TemplateNavItem orgLink={orgLink} />
      <AgreementGenNavItem orgLink={orgLink} />
      <SignNavItem orgLink={orgLink} />
      <NavLink tabIndex={-1} to={`${orgLink}/webopt`}>
        {({ isActive }) => (
          <div data-active={isActive} className={styles.navigationContainer}>
            <div className={styles.iconButtonContainer}>
              <IconButton
                icon="sparkles-md"
                size="lg"
                activatedProps={{ bg: "var(--kiwi-colors-surface-surface-container)" }}
                activated={isActive}
                data-cy="navigation_settings"
                data-lumin-btn-name={NavigationNames.SETTINGS}
                data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
              />
            </div>
            <Text size="sm" type="label">
              Discover
            </Text>
          </div>
        )}
      </NavLink>
      {isManager && (
        <>
          <div className={styles.dividerWrapper}>
            <Divider />
          </div>
          <NavLink tabIndex={-1} to={`${orgLink}/dashboard`}>
            {({ isActive }) => (
              <div data-active={isActive} className={styles.navigationContainer}>
                <div className={styles.iconButtonContainer}>
                  <IconButton
                    icon="settings-lg"
                    size="lg"
                    activatedProps={{ bg: 'var(--kiwi-colors-surface-surface-container)' }}
                    activated={isActive}
                    data-cy="navigation_settings"
                    data-lumin-btn-name={NavigationNames.SETTINGS}
                    data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
                  />
                </div>
                <Text size="sm" type="label">
                  {t('common.settings')}
                </Text>
              </div>
            )}
          </NavLink>
        </>
      )}
      {isOpenAddMemberModal && (
        <AddMemberModal
          open
          onClose={() => setOpenAddMemberModal(false)}
          onSaved={() => setOpenAddMemberModal(false)}
          updateCurrentOrganization={() => {}}
        />
      )}
    </div>
  );
};

export default OrgMainSidebar;

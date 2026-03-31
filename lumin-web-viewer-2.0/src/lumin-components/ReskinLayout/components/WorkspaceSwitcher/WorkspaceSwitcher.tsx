import { isEmpty, cloneDeep, uniqBy } from 'lodash';
import { PopoverDropdown, PopoverDropdownPaddingVariant } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';

import selectors from 'selectors';

import {
  useAvailablePersonalWorkspace,
  useGetCurrentOrganization,
  useGetOrganizationList,
  usePersonalWorkspaceLocation,
  useTranslation,
} from 'hooks';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import useShallowSelector from 'hooks/useShallowSelector';

import { userServices, organizationServices } from 'services';

import { multilingualUtils } from 'utils';
import lastAccessOrgs from 'utils/lastAccessOrgs';

import { ORG_TEXT } from 'constants/organizationConstants';
import { PLAN_TYPE_LABEL } from 'constants/plan';
import { PaymentStatus } from 'constants/plan.enum';
import { Routers } from 'constants/Routers';

import { SuggestedOrganization } from 'interfaces/organization/organization.interface';
import { OrganizationListData } from 'interfaces/redux/organization.redux.interface';

import PersonalWorkspace from './components/PersonalWorkspace/PersonalWorkspace';
import SuggestedWorkspaces from './components/SugguestedWorkspace/SuggestedWorkspace';
import UserWorkspaces from './components/UserWorkspaces/UserWorkspaces';
import WorkspaceSwitcherInfo from './components/WorkspaceSwitcherInfo/WorkspaceSwitcherInfo';
import { WorkspaceInfo, WorkspaceSwitcherProps } from './WorkspaceSwitcher.interface';

import styles from './WorkspaceSwitcher.module.scss';

const WorkspaceSwitcher = ({ onToggleSwitcher, onToggleInviteMembers, onCloseDrawer }: WorkspaceSwitcherProps) => {
  const { t } = useTranslation();

  const currentUser = useGetCurrentUser();
  const currentOrganization = useGetCurrentOrganization();
  const { organizationList: organizations } = useGetOrganizationList();
  const suggestedOrganization = useShallowSelector<SuggestedOrganization>(selectors.getMainOrganizationCanJoin);
  const isPersonalWorkspaceAvailable = useAvailablePersonalWorkspace();
  const isAtPersonalWorkspace = usePersonalWorkspaceLocation();

  // state
  const [isOnlyJoinedOneWorkspace, setIsOnlyJoinedOneWorkspace] = useState(false);
  const [updatedOrganizations, setUpdatedOrganizations] = useState<OrganizationListData[]>([]);
  const [currentWorkspaceInfo, setCurrentWorkspaceInfo] = useState<WorkspaceInfo>(null);
  const [personalWorkspaceInfo, setPersonalWorkspaceInfo] = useState<WorkspaceInfo>(null);

  const sortLastAccessOrg = (organizationList: OrganizationListData[]): OrganizationListData[] => {
    if (organizationList.length === 0) {
      return [];
    }

    const orgUrlList = lastAccessOrgs.getOrgUrlList();
    const newOrganizationList = cloneDeep(organizationList);
    const lastAccessOrgList = orgUrlList.map((orgUrl) =>
      organizationList.find((item) => item.organization.url === orgUrl)
    );
    const filteredAccessOrgs = lastAccessOrgList.filter(Boolean);
    const newOrgUrls = filteredAccessOrgs.map((item) => ({ id: item.organization._id, url: item.organization.url }));
    lastAccessOrgs.setOrgUrlsToStorage(newOrgUrls);
    return uniqBy([...filteredAccessOrgs, ...newOrganizationList], (item) => item.organization.url);
  };

  useEffect(() => {
    if (currentOrganization) {
      const { payment, avatarRemoteId, name, userRole, _id, url, settings } = currentOrganization;
      const isTrial = payment.status === PaymentStatus.TRIALING;
      setCurrentWorkspaceInfo({
        _id,
        avatarRemoteId,
        name,
        plan: isTrial
          ? t('sidebar.sidebarOwnerPane.planTrialDescription', {
              planType: PLAN_TYPE_LABEL[payment.type as keyof typeof PLAN_TYPE_LABEL],
            })
          : multilingualUtils.getPlanDescription({ t, type: payment.type }),
        settingPageUrl: organizationServices.isManager(userRole) ? `/${ORG_TEXT}/${url}/dashboard/settings` : '',
        userRole,
        inviteUsersSetting: settings.inviteUsersSetting,
      });
    }
  }, [currentOrganization?._id, currentOrganization, t]);

  useEffect(() => {
    if (isPersonalWorkspaceAvailable) {
      const {
        payment: { type },
      } = userServices.getPlanType(currentUser, organizations || []);
      setPersonalWorkspaceInfo({
        _id: currentUser._id,
        avatarRemoteId: currentUser.avatarRemoteId,
        name: currentUser.name,
        plan: multilingualUtils.getPlanDescription({ t, type }),
        settingPageUrl: Routers.SETTING.PROFILE,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPersonalWorkspaceAvailable, currentUser._id, currentUser.avatarRemoteId, currentUser.name, organizations, t]);

  useEffect(() => {
    if (isPersonalWorkspaceAvailable) {
      setIsOnlyJoinedOneWorkspace(!organizations?.length);
    } else {
      setIsOnlyJoinedOneWorkspace(organizations?.length === 1);
    }
  }, [isPersonalWorkspaceAvailable, organizations?.length]);

  useEffect(() => {
    if (organizations) {
      const sortedOrganizations = sortLastAccessOrg(organizations);
      setUpdatedOrganizations(
        sortedOrganizations.filter(({ organization }) => organization._id !== currentOrganization?._id)
      );
    }
  }, [organizations, currentOrganization?._id]);

  return (
    <PopoverDropdown paddingVariant={PopoverDropdownPaddingVariant.none} className={styles.dropdownContainer}>
      <WorkspaceSwitcherInfo
        workspace={isAtPersonalWorkspace ? personalWorkspaceInfo : currentWorkspaceInfo}
        isOnlyJoinedOneWorkspace={isOnlyJoinedOneWorkspace}
        onToggleSwitcher={onToggleSwitcher}
        onToggleInviteMembers={onToggleInviteMembers}
        currentOrganization={currentOrganization}
        onCloseDrawer={onCloseDrawer}
      />
      {!isEmpty(suggestedOrganization) && <SuggestedWorkspaces suggestedWorkspace={suggestedOrganization} />}
      {isPersonalWorkspaceAvailable && !isAtPersonalWorkspace && (
        <PersonalWorkspace workspace={personalWorkspaceInfo} onToggleSwitcher={onToggleSwitcher} />
      )}
      {Boolean(updatedOrganizations?.length) && (
        <UserWorkspaces workspaces={updatedOrganizations} onToggleSwitcher={onToggleSwitcher} />
      )}
    </PopoverDropdown>
  );
};

export default WorkspaceSwitcher;

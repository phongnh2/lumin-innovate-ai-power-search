import { Button, Text } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import selectors from 'selectors';

import { LayoutSecondary } from 'luminComponents/Layout';
import usePromptInviteUsersHandler from 'luminComponents/PromptInviteUsersBanner/hooks/usePromptInviteUsersHandler';

import { useTranslation } from 'hooks';

import { CNC_LOCAL_STORAGE_KEY } from 'features/CNC/constants/customConstant';
import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';
import showJoinedOrganizationModal from 'features/CNC/helpers/showJoinedOrganizationModal';

import { CTAEventValues, InviteActionTypes } from 'constants/featureFlagsConstant';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { Routers } from 'constants/Routers';

import { InviteToOrganizationInput, IOrganization } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

import CollaboratorsList from './component/CollaboratorsList';
import getPrioritizedUsers from './helper/getPrioritizedUsers';
import { handleInviteMembers } from './helper/handleInviteMembers';

import styles from './InviteCollaborators.module.scss';

const InviteCollaborators = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const promptInviteUsersHandler = usePromptInviteUsersHandler();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const userCollaborators =
    (JSON.parse(localStorage.getItem(CNC_LOCAL_STORAGE_KEY.DRIVE_COLLABORATORS_NOT_IN_CIRCLE)) as IUserResult[]) || [];
  const prioritizedUserCollaborators = getPrioritizedUsers(userCollaborators);

  const [selectedUsers, setSelectedUsers] = useState<InviteToOrganizationInput[]>(
    prioritizedUserCollaborators.map((user) => ({
      ...user,
      role: ORGANIZATION_ROLES.MEMBER,
    }))
  );
  const { data: currentOrganization } = useSelector<unknown, { data: IOrganization }>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const documentId = new URLSearchParams(location.search).get('documentId');
  const onSkip = ({ replace }: { replace: boolean }) => {
    navigate(`/viewer/${documentId}`, { replace });
    showJoinedOrganizationModal({ organization: currentOrganization, numberInvited: selectedUsers?.length, dispatch });
  };

  useEffect(() => {
    if (!prioritizedUserCollaborators.length) {
      onSkip({ replace: true });
    }
  }, [prioritizedUserCollaborators.length]);

  if (!documentId || !currentOrganization) {
    return navigate(Routers.ROOT, { replace: true });
  }

  return (
    <LayoutSecondary footer={false} hasBackButton={false} canClickLogo={false} isReskin>
      <div className={styles.container}>
        <div className={styles.paper}>
          <Text className={styles.title} type="headline" size="xl" color="var(--kiwi-colors-surface-on-surface)">
            <Trans i18nKey="joinOrg.inviteCollaborators" values={{ name: currentOrganization.name }} />
          </Text>
          <div className={styles.content}>
            <div className={styles.contentWrapper}>
              <div className={styles.searchSection}>
                <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
                  <Trans
                    i18nKey="setUpOrg.youJoinedWith"
                    components={{
                      b: <b className={styles.boldText} />,
                    }}
                    values={{ target: currentOrganization.name }}
                  />
                </Text>
                <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
                  {t('setUpOrg.inviteCollaboratorsDescription')}
                </Text>
              </div>
              <CollaboratorsList
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                allUsers={prioritizedUserCollaborators}
              />
            </div>
            <div className={styles.actions}>
              <Button
                size="lg"
                variant="text"
                onClick={() => onSkip({ replace: true })}
                data-lumin-btn-name={CNCButtonName.SKIP_INVITE_COLLABORATORS}
                data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.SKIP_INVITE_COLLABORATORS]}
              >
                {t('common.skip')}
              </Button>
              <Button
                size="lg"
                variant="filled"
                onClick={() =>
                  handleInviteMembers({
                    members: selectedUsers,
                    currentOrganization,
                    onSkip,
                    dispatch,
                    setIsSubmitting,
                    navigate,
                    t,
                    from: CTAEventValues[InviteActionTypes.JOIN_ORGANIZATION_FROM_OPEN_DRIVE],
                    getPromptGoogleUsersHandler: (params) =>
                      promptInviteUsersHandler.getPromptGoogleUsersHandler(params),
                  })
                }
                disabled={!selectedUsers.length}
                loading={isSubmitting}
                data-lumin-btn-name={CNCButtonName.INVITE_COLLABORATORS}
                data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.INVITE_COLLABORATORS]}
              >
                {t('memberPage.invite')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LayoutSecondary>
  );
};

export default InviteCollaborators;

import ClickAwayListener from '@mui/material/ClickAwayListener';
import classNames from 'classnames';
import { get } from 'lodash';
import { Button, Paper, Text } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import usePromptInviteUsersHandler from 'luminComponents/PromptInviteUsersBanner/hooks/usePromptInviteUsersHandler';

import organizationServices from 'services/organizationServices';

import { CNC_LOCAL_STORAGE_KEY, CNC_SESSION_STORAGE_KEY } from 'features/CNC/constants/customConstant';
import { CNCModalName } from 'features/CNC/constants/events/modal';
import { useGetInviteCollaboratorsFlag } from 'features/CNC/hooks';
import useTrackingABTestModalEvent from 'features/CNC/hooks/useTrackingABTestModalEvent';

import { documentStorage } from 'constants/documentConstants';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { InviteUsersSetting } from 'constants/organization.enum';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { InviteToOrganizationInput, IOrganization } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

import CollaboratorsList from '../InviteCollaborators/component/CollaboratorsList';
import getPrioritizedUsers from '../InviteCollaborators/helper/getPrioritizedUsers';
import { handleInviteMembers } from '../InviteCollaborators/helper/handleInviteMembers';

import styles from './InviteCollaboratorsModal.module.scss';

const InviteCollaboratorsModal = ({ hasWarningBanner }: { hasWarningBanner: boolean }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const shouldShowInviteCollaboratorsModal = useSelector(selectors.getShouldShowInviteCollaboratorsModal);
  const promptInviteUsersHandler = usePromptInviteUsersHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInviteStep, setShowInviteStep] = useState(false);
  const [modalName, setModalName] = useState(CNCModalName.PROMPT_TO_INVITE_MEMBER_TO_WORKSPACE);
  const hasShowInviteCollaboratorsModal =
    sessionStorage.getItem(CNC_SESSION_STORAGE_KEY.HAS_SHOW_INVITE_COLLABORATORS_MODAL) === 'true';
  const document = useSelector<unknown, IDocumentBase>(selectors.getCurrentDocument, shallowEqual);
  const driveUsersCanInviteToWorkspace = JSON.parse(
    localStorage.getItem(CNC_LOCAL_STORAGE_KEY.DRIVE_COLLABORATORS_NOT_IN_CIRCLE) || '[]'
  ) as IUserResult[];
  const userCollaborators = getPrioritizedUsers(driveUsersCanInviteToWorkspace);
  const prioritizedUserCollaborators = getPrioritizedUsers(userCollaborators);
  const [selectedUsers, setSelectedUsers] = useState<InviteToOrganizationInput[]>(
    prioritizedUserCollaborators.map((user) => ({
      ...user,
      role: ORGANIZATION_ROLES.MEMBER,
    }))
  );
  const shouldShowInviteCollaboratorsModalFlag = useGetInviteCollaboratorsFlag();
  const orgOfDoc = get(document, 'documentReference.data', '') as IOrganization;
  const isShared = get(document, 'sharedPermissionInfo.total', 0) !== 0;
  const inviteUsersSetting = get(orgOfDoc, 'settings.inviteUsersSetting', InviteUsersSetting.ANYONE_CAN_INVITE);
  const isNotDriveStorage = document?.service !== documentStorage.google;

  const { userRole }: IOrganization = orgOfDoc || ({} as IOrganization);
  const isOrgManager = organizationServices.isManager(userRole);
  const isAllowMemberCanInvite = inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE;
  const canInviteCollaborators = isAllowMemberCanInvite || isOrgManager;

  const { trackModalConfirmation, trackModalDismiss } = useTrackingABTestModalEvent({
    modalName,
    hotjarEvent: HOTJAR_EVENT.PROMPT_TO_INVITE_MEMBER_TO_WORKSPACE,
  });

  const onClose = () => {
    dispatch(actions.setShouldShowInviteCollaboratorsModal(false));
    sessionStorage.setItem(CNC_SESSION_STORAGE_KEY.HAS_SHOW_INVITE_COLLABORATORS_MODAL, 'true');
    setShowInviteStep(false);
  };

  const handleCancel = () => {
    trackModalDismiss().catch(() => {});
    onClose();
  };

  const handleShowInviteStep = () => {
    trackModalConfirmation().catch(() => {});
    setShowInviteStep(true);
    setModalName(CNCModalName.INVITE_MEMBER_TO_WORKSPACE);
  };

  const handleOnClickInvite = () => {
    trackModalConfirmation().catch(() => {});
    handleInviteMembers({
      members: selectedUsers,
      currentOrganization: orgOfDoc,
      onSkip: () => {},
      dispatch,
      setIsSubmitting,
      navigate,
      t,
      from: CNCModalName.INVITE_MEMBER_TO_WORKSPACE,
      getPromptGoogleUsersHandler: (params) => promptInviteUsersHandler.getPromptGoogleUsersHandler(params),
    }).catch(() => {});
    onClose();
  };

  if (
    !shouldShowInviteCollaboratorsModal ||
    !userCollaborators.length ||
    hasShowInviteCollaboratorsModal ||
    !shouldShowInviteCollaboratorsModalFlag ||
    isShared ||
    !canInviteCollaborators ||
    isNotDriveStorage
  ) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={handleCancel}>
      <Paper
        className={classNames(styles.container, { [styles.hasWarningBanner]: hasWarningBanner })}
        elevation="md"
        radius="lg"
      >
        {showInviteStep ? (
          <div className={styles.paper}>
            <Text className={styles.title} type="headline" size="sm" color="var(--kiwi-colors-surface-on-surface)">
              {t('memberPage.inviteCollaborators')}
            </Text>
            <Text className={styles.description} type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
              {t('inviteCollaboratorsModal.foundCollaborators')}
            </Text>
            <div className={styles.content}>
              <div className={styles.contentWrapper}>
                <CollaboratorsList
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  allUsers={prioritizedUserCollaborators}
                />
              </div>
              <div className={styles.actions}>
                <Button size="lg" variant="text" onClick={handleCancel}>
                  {t('common.cancel')}
                </Button>
                <Button
                  size="lg"
                  variant="filled"
                  onClick={handleOnClickInvite}
                  disabled={!selectedUsers.length}
                  loading={isSubmitting}
                >
                  {t('memberPage.invite')}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.content}>
              <Text type="headline" size="sm" color="var(--kiwi-colors-surface-on-surface)">
                {t('inviteCollaboratorsModal.title')}
              </Text>
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
                <Trans
                  i18nKey="inviteCollaboratorsModal.description"
                  components={{
                    b: <b className={styles.boldText} />,
                  }}
                />
              </Text>
            </div>
            <div className={styles.actions}>
              <Button size="lg" variant="text" onClick={handleCancel}>
                {t('inviteCollaboratorsModal.skip')}
              </Button>
              <Button size="lg" variant="filled" onClick={handleShowInviteStep}>
                {t('inviteCollaboratorsModal.invite')}
              </Button>
            </div>
          </>
        )}
      </Paper>
    </ClickAwayListener>
  );
};

export default InviteCollaboratorsModal;

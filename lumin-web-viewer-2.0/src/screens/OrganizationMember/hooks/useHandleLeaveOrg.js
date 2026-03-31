import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { socket } from 'src/socket';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation, useNavigateUser, useEnableWebReskin } from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils, errorUtils } from 'utils';
import errorExtract from 'utils/error';
import { OrganizationUtilities } from 'utils/Factory/Organization';

import { ErrorCode } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_ROLES, ORG_TEXT } from 'constants/organizationConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { TEAMS_TEXT } from 'constants/teamConstant';

import styles from '../OrganizationMember.module.scss';
import * as Styled from '../OrganizationMember.styled';

export const useHandleLeaveOrg = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization });
  const { _id: orgId, userRole, name: orgName, url } = currentOrganization;
  const currentUserRole = userRole.toUpperCase();
  const { goToOrgListOrPersonalDocs } = useNavigateUser();
  const { isEnableReskin } = useEnableWebReskin();

  const primaryTextClassName = isEnableReskin ? 'kiwi-message--primary' : '';

  const warningAdminModal = (warningType) => {
    let modalSettings;
    switch (warningType) {
      case ORGANIZATION_ROLES.ORGANIZATION_ADMIN:
        modalSettings = {
          type: ModalTypes.WARNING,
          title: t('memberPage.transferOwnership'),
          message: (
            <h3>
              <Trans
                i18nKey="memberPage.leaveOrgModal.messageWarningOrgAdmin"
                components={{ b: <Styled.PrimaryText className={primaryTextClassName} /> }}
                values={{ orgName }}
              />
            </h3>
          ),
          isFullWidthButton: !isEnableReskin,
          confirmButtonTitle: t('common.gotIt'),
          useReskinModal: true,
          onConfirm: () => {},
        };
        break;
      case ORGANIZATION_ROLES.TEAM_ADMIN:
        modalSettings = {
          type: ModalTypes.WARNING,
          title: t('memberPage.transferOwnership'),
          message: (
            <h3>
              <Trans
                i18nKey="memberPage.leaveOrgModal.messageWarningTeamAdmin"
                components={{ b: <Styled.PrimaryText className={primaryTextClassName} /> }}
                values={{ orgName }}
              />
            </h3>
          ),
          isFullWidthButton: !isEnableReskin,
          confirmButtonTitle: t('memberPage.leaveOrgModal.goToTeams'),
          onConfirm: () => navigate(`/${ORG_TEXT}/${url}/${TEAMS_TEXT}`),
          cancelButtonTitle: t('action.close'),
          onCancel: () => {},
          useReskinModal: true,
        };
        break;
      default:
        break;
    }
    dispatch(actions.openModal(modalSettings));
  };

  const handleLeaveOrgLogic = async () => {
    try {
      await organizationServices.leaveOrganization({ orgId });
      socket.emit(SOCKET_EMIT.REMOVE_ORG_MEMBER, {
        orgId,
        userId: currentUser._id,
      });
      dispatch(actions.removeOrganizationInListById(orgId));
      goToOrgListOrPersonalDocs();
    } catch (err) {
      const { code } = errorExtract.extractGqlError(err);
      if (code === ErrorCode.Org.LAST_JOINED_ORGANIZATION) {
        toastUtils.error({
          message: t('orgSettings.tooltipLeaveLastJoinedOrg'),
        });
        return;
      }
      if (errorUtils.handleScimBlockedError(err)) {
        return;
      }
      logger.logError({ error: err });
    }
  };

  const leaveOrgModal = () => {
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('memberPage.leaveOrg1'),
      message: (
        <div>
          <Trans
            i18nKey="memberPage.leaveOrgModal.leaveOrgModalDesc"
            components={{ b: <b className={primaryTextClassName} /> }}
            values={{ orgName }}
          />
          <ul className={styles.leaveWorkspaceModalDesc}>
            <li>
              <Trans
                i18nKey="memberPage.leaveOrgModal.leaveOrgModalDesc1"
                components={{ b: <b className={primaryTextClassName} /> }}
              />
            </li>
            <li>{t('memberPage.leaveOrgModal.leaveOrgModalDesc2')}</li>
            <li>{t('memberPage.leaveOrgModal.leaveOrgModalDesc3')}</li>
          </ul>
          <br />
          {t('memberPage.leaveOrgModal.leaveOrgModalDesc4')}
        </div>
      ),
      confirmButtonTitle: t('common.leave'),
      onConfirm: () => handleLeaveOrgLogic(),
      cancelButtonTitle: t('common.cancel'),
      onCancel: () => {},
      useReskinModal: true,
    };
    dispatch(actions.openModal(modalSettings));
  };

  async function handleTransferOrgAdmin() {
    const res = await organizationServices.checkOrganizationTransfering({
      orgId,
    });
    res
      ? organizationServices.renderProcessingTransferModal({ t, isEnableReskin })
      : warningAdminModal(ORGANIZATION_ROLES.ORGANIZATION_ADMIN);
  }

  const handleLeaveOrg = () => {
    const isOrgAdmin = currentUserRole === ORGANIZATION_ROLES.ORGANIZATION_ADMIN;
    if (isOrgAdmin) {
      return handleTransferOrgAdmin();
    }
    if (orgUtilities.isTeamAdmin()) {
      return warningAdminModal(ORGANIZATION_ROLES.TEAM_ADMIN);
    }
    return leaveOrgModal();
  };

  return { handleLeaveOrg };
};

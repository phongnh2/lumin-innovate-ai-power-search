/* eslint-disable react/jsx-no-bind */
import produce from 'immer';
import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { batch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Icomoon from 'luminComponents/Icomoon';
import RequestToPayOrganizationModal from 'luminComponents/RequestToPayOrganizationModal';

import { useEnableWebReskin, useTranslation } from 'hooks';
import useSignSeatAssignment from 'hooks/useSignSeatAssignment';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { commonUtils, dateUtil, errorUtils, toastUtils } from 'utils';
import errorExtract from 'utils/error';
import { OrganizationUtilities } from 'utils/Factory/Organization';
import { lazyWithRetry } from 'utils/lazyWithRetry';
import { PaymentUrlSerializer } from 'utils/payment';

import { DefaultErrorCode, ErrorCode } from 'constants/errorCode';
import { LOGGER, ModalTypes } from 'constants/lumin-common';
import {
  ERROR_MESSAGE_NOT_FOUND,
  ERROR_MESSAGE_UNKNOWN_ERROR,
  RELOAD_MESSAGE,
  ERROR_MESSAGE_ORG,
} from 'constants/messages';
import { ORGANIZATION_MEMBER_TYPE, ORGANIZATION_ROLE_TEXT, ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { PERIOD, Plans } from 'constants/plan';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { Colors } from 'constants/styles';

import { AcceptReject, ActionButton, MemberItemBody, SeatRequestMenu } from './components';
import { getModalUpgradingSettings } from './helpers';
import { socket } from '../../socket';

import * as Styled from './MemberOrgRow.styled';

import styles from './MemberOrgRow.module.scss';

const MemberOrgRowTransferModal = lazyWithRetry(() => import('./MemberOrgRowTransferModal'));

const propTypes = {
  currentUser: PropTypes.object,
  member: PropTypes.object,
  listToShow: PropTypes.string,
  currentOrganization: PropTypes.object.isRequired,
  refetchList: PropTypes.func,
  openModal: PropTypes.func,
  closeModal: PropTypes.func,
  updateCurrentOrganization: PropTypes.func,
  updateOrganizationInList: PropTypes.func,
  checkTransferTeams: PropTypes.func.isRequired,
  updateModalProperties: PropTypes.func.isRequired,
  currentPaymentMethod: PropTypes.object,
};

const defaultProps = {
  currentUser: {},
  member: {},
  listToShow: ORGANIZATION_MEMBER_TYPE.MEMBER,
  refetchList: () => {},
  openModal: () => {},
  closeModal: () => {},
  updateCurrentOrganization: () => {},
  updateOrganizationInList: () => {},
};

const roleLevel = {
  [ORGANIZATION_ROLES.ORGANIZATION_ADMIN]: 2,
  [ORGANIZATION_ROLES.BILLING_MODERATOR]: 1,
  [ORGANIZATION_ROLES.MEMBER]: 0,
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function MemberOrgRow(props) {
  const {
    member,
    currentUser,
    listToShow,
    currentOrganization,
    refetchList,
    openModal,
    closeModal,
    updateCurrentOrganization,
    updateOrganizationInList,
    checkTransferTeams,
    updateModalProperties,
    currentPaymentMethod,
  } = props;

  const {
    _id: orgId,
    owner,
    userRole,
    name: orgName,
    payment,
    totalMember,
    totalSignSeats,
    availableSignSeats,
  } = currentOrganization;

  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization });
  const navigate = useNavigate();
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [showRequestToPay, setShowRequestToPay] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [invitationProcessing, setInvitationProcessing] = useState({
    isSending: false,
    isRemoving: false,
  });
  const [seatProcessing, setSeatProcessing] = useState({
    isAssigning: false,
    isUnassigning: false,
    isRejecting: false,
  });
  const [openedMenuActions, setOpenedMenuActions] = useState(false);
  const [openedSeatRequestMenu, setOpenedSeatRequestMenu] = useState(false);

  const { handleAssignSeat: assignSeat, handleUnassignSeat: unassignSeat } = useSignSeatAssignment({
    organization: currentOrganization,
    currentPaymentMethod,
  });

  const myRole = userRole.toUpperCase();
  const memberRole = member.role.toUpperCase();
  const isMemberRoleUser = memberRole === ORGANIZATION_ROLES.MEMBER;
  const isMemberRoleBillingModerator = memberRole === ORGANIZATION_ROLES.BILLING_MODERATOR;
  const isMemberHasSameAdminRole = isMemberRoleBillingModerator && memberRole === myRole;
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const primaryTextClassName = isEnableReskin ? 'kiwi-message--primary' : '';

  const textMakeText = (text) => commonUtils.formatTitleCaseByLocale(t('memberPage.makeText', { text }));

  function isOwner() {
    return owner._id === currentUser._id;
  }

  function _isHigherRole(higherRole, lowerRole) {
    return roleLevel[higherRole] > roleLevel[lowerRole];
  }

  const handleErrorUserNotFound = (code) => {
    if (code === ErrorCode.User.USER_NOT_FOUND) {
      refetchList();
      toastUtils.error({ message: t(ERROR_MESSAGE_NOT_FOUND) });
    }
  };

  const addMemberFailed = async (err) => {
    const { code, metadata } = errorExtract.extractGqlError(err);
    const isUpgrading = code === ErrorCode.Org.UPGRADING_INVOICE;
    const modalSettings = getModalUpgradingSettings({ t, metadata });
    if (isUpgrading) {
      openModal(modalSettings);
    }

    handleErrorUserNotFound(code);

    errorUtils.handleScimBlockedError(err);
  };

  const addMemberToOrganization = async (userId) => {
    try {
      setShowRequestToPay(false);
      await organizationServices.acceptRequestingAccess({ orgId, userId });
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('memberPage.requesterHasBeenAccepted'),
      });
      await refetchList();
    } catch (err) {
      addMemberFailed(err);
    }
  };

  const onRequestConfirm = async () => {
    if (payment?.period === PERIOD.MONTHLY) {
      await addMemberToOrganization(member._id);
      const updatedData = produce(currentOrganization, (draft) => {
        draft.payment.quantity = totalMember + 1;
      });
      batch(() => {
        updateCurrentOrganization(updatedData);
        updateOrganizationInList(orgId, updatedData);
      });
      return;
    }
    navigate(getPaymentRedirectUrl());
  };

  function getPaymentRedirectUrl() {
    return new PaymentUrlSerializer()
      .of(orgId)
      .period(payment?.period || PERIOD.MONTHLY)
      .plan(Plans.BUSINESS)
      .quantityParam(totalMember + 1)
      .returnUrlParam()
      .get();
  }

  async function handleTransferAdmin() {
    const res = await organizationServices.checkOrganizationTransfering({ orgId });
    return res ? organizationServices.renderProcessingTransferModal({ t, isEnableReskin }) : setOpenTransferModal(true);
  }

  function deleteUser(memberData, memberType) {
    if (memberType) {
      return organizationServices.deletePendingInvite({ orgId, email: memberData.email });
    }
    return organizationServices.deleteMemberInOrganization({ orgId, userId: memberData._id });
  }

  function beforeSave(memberData, memberType) {
    const selected = {
      _id: memberData._id,
      email: memberData.email,
    };
    checkTransferTeams(selected, () => {
      const modalSetting = {
        type: ModalTypes.WARNING,
        title: t('memberPage.removeMember'),
        message: (
          <div>
            <Trans
              i18nKey="memberPage.removeMemberDesc"
              values={{ name: memberData.name, orgName }}
              components={{ bold: <b className={primaryTextClassName} />, br: <br /> }}
            />
            <ul className={styles.removeMemberDesc}>
              <li>
                <Trans
                  i18nKey="memberPage.removeMemberDesc1"
                  components={{ bold: <b className={primaryTextClassName} /> }}
                />
              </li>
              <li>{t('memberPage.removeMemberDesc2')}</li>
              <li>{t('memberPage.removeMemberDesc3')}</li>
            </ul>
            <br />
            {t('memberPage.removeMemberDesc4')}
          </div>
        ),
        confirmButtonTitle: t('common.remove'),
        onCancel: () => {},
        onConfirm: () => handleDeleteUser(memberData, memberType),
        closeOnConfirm: false,
        useReskinModal: true,
      };
      openModal(modalSetting);
    });
  }

  const handleResendInvite = async () => {
    try {
      setInvitationProcessing((prevState) => ({ ...prevState, isSending: true }));
      await organizationServices.resendOrganizationInvitation(orgId, member._id);
      toastUtils.success({
        message: t('memberPage.invitationHasJustBeenResent'),
      });
    } catch (error) {
      const { code: errorCode, metadata } = errorExtract.extractGqlError(error);
      let errorMessage;
      switch (errorCode) {
        case ErrorCode.Org.ORG_INVITATION_ALREADY_SENT: {
          const remainingTime =
            metadata.ttl > 0 ? t('memberPage.textMinutes', { text: metadata.ttl }) : t('memberPage.fewSeconds');
          errorMessage = t('memberPage.errorResendInvite', { remainingTime });
          break;
        }
        case ErrorCode.Org.ACTION_BLOCKED_BY_SCIM:
          errorMessage = t(ERROR_MESSAGE_ORG.ACTION_BLOCKED_BY_SCIM);
          break;
        default:
          errorMessage = t(ERROR_MESSAGE_UNKNOWN_ERROR);
          break;
      }
      toastUtils.error({
        message: errorMessage,
      });
    } finally {
      setInvitationProcessing((prevState) => ({ ...prevState, isSending: false }));
    }
  };

  const handleRemoveInvitation = async () => {
    try {
      setInvitationProcessing((prevState) => ({ ...prevState, isRemoving: true }));
      await organizationServices.removeOrganizationInvitation(orgId, member._id);
      toastUtils.success({
        message: t('memberPage.invitationHasBeenRemoved'),
      });
    } catch (error) {
      const { code: errorCode } = errorExtract.extractGqlError(error);
      let errorMessage;
      switch (errorCode) {
        case DefaultErrorCode.NOT_FOUND:
          errorMessage = t(RELOAD_MESSAGE);
          break;
        case ErrorCode.Org.ACTION_BLOCKED_BY_SCIM:
          errorMessage = t(ERROR_MESSAGE_ORG.ACTION_BLOCKED_BY_SCIM);
          break;
        default:
          errorMessage = t(ERROR_MESSAGE_UNKNOWN_ERROR);
          break;
      }
      toastUtils.error({
        message: errorMessage,
      });
    } finally {
      setInvitationProcessing((prevState) => ({ ...prevState, isRemoving: false }));
      await refetchList();
    }
  };

  function handleDeleteMemberError(error, memberName) {
    const { code: errorCode } = errorExtract.extractGqlError(error);
    let errorMessage;
    switch (errorCode) {
      case ErrorCode.Org.CANNOT_REMOVE_TEAM_ADMIN:
        errorMessage = (
          <span>
            <Trans
              i18nKey="memberPage.errorRemoveTeamAdmin"
              values={{ memberName, orgName }}
              components={{ b: <Styled.PrimaryText className={primaryTextClassName} /> }}
            />
          </span>
        );
        break;
      case ErrorCode.Org.GRANTED_ADMIN_IS_PROCESSING:
        errorMessage = (
          <span>
            <Trans
              i18nKey="memberPage.errorAdminIsProcessing"
              values={{ memberName }}
              components={{ b: <Styled.PrimaryText className={primaryTextClassName} /> }}
            />
          </span>
        );
        break;
      default:
        break;
    }
    if (errorMessage) {
      const modalSetting = {
        type: ModalTypes.ERROR,
        title: t('memberPage.unableToRemoveMember'),
        message: errorMessage,
        confirmButtonTitle: t('common.ok'),
        isFullWidthButton: !isEnableReskin,
        onConfirm: closeModal,
        useReskinModal: true,
      };
      openModal(modalSetting);
    }
    errorUtils.handleScimBlockedError(error);
  }

  async function handleDeleteUser(memberData, memberType) {
    const { _id: memberId, name, isSignProSeat } = memberData;
    try {
      setIsDeleting(true);
      updateModalProperties({
        isProcessing: true,
      });
      await deleteUser(memberData, memberType);
      if (!memberType) {
        socket.emit(SOCKET_EMIT.REMOVE_ORG_MEMBER, { orgId, userId: memberId });
      }

      if (isSignProSeat && !memberType) {
        const updatedOrgData = {
          ...currentOrganization,
          totalSignSeats,
          availableSignSeats: availableSignSeats + 1,
        };

        batch(() => {
          updateCurrentOrganization(updatedOrgData);
          updateOrganizationInList(currentOrganization._id, updatedOrgData);
        });
      }

      await refetchList();
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('memberPage.memberHasBeenRemoved'),
      });
      closeModal();
    } catch (error) {
      closeModal();
      handleDeleteMemberError(error, name);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSetMemberRole(targetRole) {
    const isSetAdmin = targetRole === ORGANIZATION_ROLES.ORGANIZATION_ADMIN;
    try {
      const newMemberRole = { email: member.email, role: targetRole };
      await organizationServices.setOrganizationMembersRole(orgId, [newMemberRole]);
      logger.logInfo({
        message: LOGGER.EVENT.CHANGE_ROLE_ORGANIZATION,
        reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
      });
      if (isSetAdmin) {
        organizationServices.renderProcessingTransferModal({ t, isEnableReskin });
      } else {
        await refetchList();
        toastUtils.openToastMulti({
          type: ModalTypes.SUCCESS,
          message: t('memberPage.memberRoleHasBeenChanged'),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOpenTransferModal(false);
    }
  }

  async function handleAssignSeat() {
    await assignSeat({
      userId: member._id,
      userName: member.name,
      organizationData: currentOrganization,
      onRefetchList: refetchList,
      onLoadingStateChange: (isLoading) => {
        setSeatProcessing((prevState) => ({ ...prevState, isAssigning: isLoading }));
      },
    });
  }

  function getUnassignSeatModalMessage(memberName) {
    return (
      <div>
        <Trans
          i18nKey="memberPage.luminSignSeat.unassignSeatDesc"
          values={{ name: memberName }}
          components={{
            strong: <b className={primaryTextClassName} />,
            br: <br />,
          }}
        />
        <br />
        <Trans
          i18nKey="memberPage.luminSignSeat.unassignSeatImpact"
          values={{
            availableSeats: availableSignSeats + 1,
          }}
          components={{
            strong: <b className={primaryTextClassName} />,
          }}
        />
      </div>
    );
  }

  async function confirmUnassignSeat(member) {
    await unassignSeat({
      userId: member._id,
      userName: member.name,
      organizationData: currentOrganization,
      onRefetchList: refetchList,
      onLoadingStateChange: (isLoading) => {
        setSeatProcessing((prevState) => ({ ...prevState, isUnassigning: isLoading }));
      },
    });
  }

  function handleUnassignSeat(member) {
    const modalSetting = {
      type: ModalTypes.WARNING,
      title: t('memberPage.luminSignSeat.unassignSeatTitle', { name: member.name }),
      message: getUnassignSeatModalMessage(member.name),
      confirmButtonTitle: t('common.confirm'),
      cancelButtonTitle: t('common.dismiss'),
      onConfirm: () => confirmUnassignSeat(member),
      onCancel: () => {},
      closeOnConfirm: false,
      useReskinModal: true,
    };
    openModal(modalSetting);
  }

  async function refetchListAndOpenToast({ type = ModalTypes.SUCCESS, i18nKey, values }) {
    await refetchList();
    toastUtils.openToastMulti({
      type,
      message: (
        <span>
          <Trans i18nKey={i18nKey} values={values} components={{ strong: <b className={primaryTextClassName} /> }} />
        </span>
      ),
    });
  }

  async function handleRejectSignSeat() {
    try {
      setSeatProcessing((prevState) => ({ ...prevState, isRejecting: true }));

      await organizationServices.rejectSignSeatRequests({
        orgId,
        userIds: [member._id],
      });
      refetchListAndOpenToast({
        type: ModalTypes.SUCCESS,
        i18nKey: 'memberPage.luminSignSeat.rejectSeatSuccess',
        values: { name: member.name },
      });
    } catch (err) {
      const { code: errorCode } = errorExtract.extractGqlError(err);
      if (errorCode === ErrorCode.Org.SEAT_REQUEST_ALREADY_REJECTED) {
        refetchListAndOpenToast({
          type: ModalTypes.SUCCESS,
          i18nKey: 'memberPage.luminSignSeat.rejectSeatSuccess',
          values: { name: member.name },
        });
      } else {
        logger.logError({
          reason: LOGGER.Service.GRAPHQL_ERROR,
          error: err,
          message: 'Failed to reject sign seat',
        });
      }
    } finally {
      setSeatProcessing((prevState) => ({ ...prevState, isRejecting: false }));
    }
  }

  const withClosePopper = (callback, closePopper) => () => {
    callback();
    closePopper();
    return true;
  };

  // eslint-disable-next-line react/prop-types
  const _renderPopperContent = ({ closePopper }) =>
    listToShow === ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER ? (
      <Styled.Menu>
        <Styled.MenuItem
          onMouseOver={() => MemberOrgRowTransferModal.preload()}
          onClick={withClosePopper(handleResendInvite, closePopper)}
        >
          <Icomoon className="resend" size={18} color={Colors.NEUTRAL_80} />
          <Styled.MenuText>{t('memberPage.resendInvite')}</Styled.MenuText>
        </Styled.MenuItem>
        {!isMemberHasSameAdminRole && (
          <Styled.MenuItem
            onMouseOver={() => MemberOrgRowTransferModal.preload()}
            onClick={withClosePopper(handleRemoveInvitation, closePopper)}
          >
            <Icomoon className="trash" size={18} color={Colors.NEUTRAL_80} />
            <Styled.MenuText>{t('memberPage.removeInvite')}</Styled.MenuText>
          </Styled.MenuItem>
        )}
      </Styled.Menu>
    ) : (
      <Styled.Menu>
        {myRole === ORGANIZATION_ROLES.ORGANIZATION_ADMIN && (
          <Styled.MenuItem
            onMouseOver={() => MemberOrgRowTransferModal.preload()}
            onClick={withClosePopper(handleTransferAdmin, closePopper)}
          >
            <Icomoon className="user-admin" size={18} color={Colors.NEUTRAL_80} />
            <Styled.MenuText>{textMakeText(t('roleText.orgAdmin'))}</Styled.MenuText>
          </Styled.MenuItem>
        )}
        {[ORGANIZATION_ROLES.ORGANIZATION_ADMIN, ORGANIZATION_ROLES.BILLING_MODERATOR].includes(myRole) &&
          isMemberRoleUser && (
            <Styled.MenuItem
              onClick={withClosePopper(() => handleSetMemberRole(ORGANIZATION_ROLES.BILLING_MODERATOR), closePopper)}
            >
              <Icomoon className="moderator" size={16} color={Colors.NEUTRAL_80} />
              <Styled.MenuText>{textMakeText(t('roleText.billingModerator'))}</Styled.MenuText>
            </Styled.MenuItem>
          )}
        {myRole === ORGANIZATION_ROLES.ORGANIZATION_ADMIN && isMemberRoleBillingModerator && (
          <Styled.MenuItem onClick={withClosePopper(() => handleSetMemberRole(ORGANIZATION_ROLES.MEMBER), closePopper)}>
            <Icomoon className="user" size={16} color={Colors.NEUTRAL_80} />
            <Styled.MenuText>{textMakeText(t('roleText.member'))}</Styled.MenuText>
          </Styled.MenuItem>
        )}
        <Styled.Divider />
        <Styled.MenuItem onClick={withClosePopper(() => beforeSave(member, false), closePopper)}>
          <Icomoon className="trash" size={16} color={Colors.NEUTRAL_80} />
          <Styled.MenuText>{t('memberPage.removeMember1')}</Styled.MenuText>
        </Styled.MenuItem>
      </Styled.Menu>
    );

  const canUnassignSeat = () => {
    const isActiveMember = [ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER, ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST].includes(
      listToShow
    );
    const hasUnassignPermission = isOwner() || organizationServices.isManager(myRole);
    const isMemberLuminSignPro = member.isSignProSeat;

    return isActiveMember && isMemberLuminSignPro && hasUnassignPermission;
  };

  const checkRenderingActionButtonPermission = () => {
    switch (listToShow) {
      case ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER:
        return ORGANIZATION_ROLES.MEMBER !== myRole && (_isHigherRole(myRole, memberRole) || isMemberHasSameAdminRole);
      case ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER:
      case ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST:
        return (
          (member._id === currentUser._id && canUnassignSeat()) ||
          (member._id !== currentUser._id && (isOwner() || _isHigherRole(myRole, memberRole)))
        );
      case ORGANIZATION_MEMBER_TYPE.MEMBER:
        return (
          ORGANIZATION_ROLES.MEMBER !== myRole &&
          member._id !== currentUser._id &&
          (isOwner() || _isHigherRole(myRole, memberRole))
        );
      default:
        return false;
    }
  };

  const renderActionButton = () => {
    if (listToShow === ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS) {
      return (
        member._id !== currentUser._id &&
        [ORGANIZATION_ROLES.ORGANIZATION_ADMIN, ORGANIZATION_ROLES.BILLING_MODERATOR].includes(myRole) && (
          <AcceptReject
            isReskin={isEnableReskin}
            member={member}
            refetchList={refetchList}
            totalMember={totalMember}
            setShowRequestToPay={setShowRequestToPay}
            redirectUrl={getPaymentRedirectUrl()}
            addMemberToOrganization={addMemberToOrganization}
            handleErrorUserNotFound={handleErrorUserNotFound}
          />
        )
      );
    }
    return (
      checkRenderingActionButtonPermission() && (
        <ActionButton
          opened={openedMenuActions}
          setOpened={setOpenedMenuActions}
          myRole={myRole}
          listToShow={listToShow}
          onTransferOwner={handleTransferAdmin}
          invitationProcessing={invitationProcessing}
          onResendInvitation={handleResendInvite}
          onRemoveInvitation={handleRemoveInvitation}
          onSetMemberRole={handleSetMemberRole}
          onRemoveMember={() => beforeSave(member, false)}
          onUnassignSeat={() => handleUnassignSeat(member)}
          isMemberRoleUser={isMemberRoleUser}
          isMemberHasSameAdminRole={isMemberHasSameAdminRole}
          isMemberRoleBillingModerator={isMemberRoleBillingModerator}
          isCurrentUser={member._id === currentUser._id}
          canUnassignSeat={canUnassignSeat()}
        />
      )
    );
  };

  const renderSeatStatus = () => {
    if (member.isSeatRequest) {
      return (
        <SeatRequestMenu
          opened={openedSeatRequestMenu}
          availableSignSeats={availableSignSeats}
          setOpened={setOpenedSeatRequestMenu}
          onAccept={handleAssignSeat}
          onReject={handleRejectSignSeat}
          isProcessing={seatProcessing.isAssigning || seatProcessing.isUnassigning || seatProcessing.isRejecting}
        />
      );
    }

    if (member.isSignProSeat) {
      return <span className={styles.memberSignSeat}>{t('memberPage.luminSignSeat.pro')}</span>;
    }

    return (
      <Button
        className={styles.memberAssignSeat}
        variant="outlined"
        onClick={handleAssignSeat}
        loading={seatProcessing.isAssigning}
      >
        {t('memberPage.luminSignSeat.assignSeat')}
      </Button>
    );
  };

  const renderExtraInfo = () => {
    if ([ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER, ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST].includes(listToShow)) {
      return (
        <>
          <span className={styles.memberDateAction}>
            {member.joinDate ? dateUtil.formatMDYTime(member.joinDate) : '-'}
          </span>

          {renderSeatStatus()}
        </>
      );
    }
    if (listToShow === ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS) {
      return (
        <span className={styles.memberDateAction}>
          {member?.requestDate ? dateUtil.formatMDYTime(member.requestDate) : '-'}
        </span>
      );
    }
    if (listToShow === ORGANIZATION_MEMBER_TYPE.MEMBER) {
      return (
        <>
          <span className={styles.memberDateAction}>
            {member?.joinDate ? dateUtil.formatMDYTime(member.joinDate) : '-'}
          </span>
          <span className={styles.memberSignSeat}>
            {member.isSignProSeat ? t('memberPage.luminSignSeat.pro') : t('memberPage.luminSignSeat.free')}
          </span>
        </>
      );
    }
    return null;
  };

  if (isEnableReskin) {
    return (
      <>
        <div className={styles.container} data-list-type={listToShow.toLowerCase()} data-selected={openedMenuActions}>
          <MemberItemBody isReskin listToShow={listToShow} member={member} currentUserId={currentUser._id} />
          <span className={styles.memberRole} data-role={memberRole.toLowerCase()}>
            {t(ORGANIZATION_ROLE_TEXT[memberRole])}
          </span>
          {renderExtraInfo()}
          {renderActionButton()}
        </div>
        {openTransferModal && (
          <MemberOrgRowTransferModal
            onClose={() => setOpenTransferModal(false)}
            onSave={() => handleSetMemberRole(ORGANIZATION_ROLES.ORGANIZATION_ADMIN)}
            member={member}
          />
        )}
        {showRequestToPay && (
          <RequestToPayOrganizationModal
            onCancel={() => setShowRequestToPay(false)}
            getNewMemberCount={() =>
              totalMember + 1 - (orgUtilities.payment.isBusiness() ? Number(payment.quantity) : 0)
            }
            onConfirm={onRequestConfirm}
          />
        )}
      </>
    );
  }

  if (listToShow === ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER) {
    return (
      <Styled.Container container $disabled={isDeleting}>
        <Styled.Item item sm={4} xs={10}>
          <MemberItemBody listToShow={listToShow} member={member} currentUserId={currentUser._id} />
        </Styled.Item>

        <Styled.Item item sm={3} xs={3} $hideInMobile>
          <Styled.Role $role={member.role.toUpperCase()}>{t(ORGANIZATION_ROLE_TEXT[memberRole])}</Styled.Role>
        </Styled.Item>
        <Styled.Item item sm={3} xs={3} $hideInMobile />
        <Styled.Item container item sm={2} xs={2} justifyContent="flex-end">
          {ORGANIZATION_ROLES.MEMBER !== myRole && (_isHigherRole(myRole, memberRole) || isMemberHasSameAdminRole) && (
            <Styled.PopperButton
              popperProps={{
                parentOverflow: 'viewport',
                placement: 'bottom-end',
                scrollWillClosePopper: true,
              }}
              renderPopperContent={_renderPopperContent}
            >
              <Icomoon className="more-v" size={14} color={Colors.NEUTRAL_60} />
            </Styled.PopperButton>
          )}
        </Styled.Item>
      </Styled.Container>
    );
  }

  if (listToShow === ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS) {
    return (
      <>
        <Styled.Container container $disabled={isDeleting}>
          <Styled.Item item sm={4} xs={10}>
            <MemberItemBody listToShow={listToShow} member={member} currentUserId={currentUser._id} />
          </Styled.Item>
          <Styled.Item item sm={3} xs={3} $hideInMobile>
            <Styled.Role $role={member.role.toUpperCase()}>{t(ORGANIZATION_ROLE_TEXT[memberRole])}</Styled.Role>
          </Styled.Item>
          <Styled.Item item sm={3} xs={3} $hideInMobile>
            <Styled.Date>{member?.requestDate ? dateUtil.formatMDYTime(member.requestDate) : '-'}</Styled.Date>
          </Styled.Item>
          <Styled.Item container item sm={2} xs={2} justifyContent="flex-end">
            {member._id !== currentUser._id &&
              [ORGANIZATION_ROLES.ORGANIZATION_ADMIN, ORGANIZATION_ROLES.BILLING_MODERATOR].includes(myRole) && (
                <AcceptReject
                  member={member}
                  refetchList={refetchList}
                  totalMember={totalMember}
                  setShowRequestToPay={setShowRequestToPay}
                  redirectUrl={getPaymentRedirectUrl()}
                  addMemberToOrganization={addMemberToOrganization}
                  handleErrorUserNotFound={handleErrorUserNotFound}
                />
              )}
          </Styled.Item>
        </Styled.Container>
        {showRequestToPay && (
          <RequestToPayOrganizationModal
            onCancel={() => setShowRequestToPay(false)}
            getNewMemberCount={() =>
              totalMember + 1 - (orgUtilities.payment.isBusiness() ? Number(payment.quantity) : 0)
            }
            onConfirm={onRequestConfirm}
          />
        )}
      </>
    );
  }

  if ([ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER, ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST].includes(listToShow)) {
    return (
      <Styled.Container container $disabled={isDeleting}>
        <Styled.Item item sm={4} xs={11}>
          <MemberItemBody listToShow={listToShow} member={member} currentUserId={currentUser._id} />
        </Styled.Item>
        <Styled.Item item sm={3} xs={3} $hideInMobile>
          <Styled.Role $role={member.role.toUpperCase()}>{t(ORGANIZATION_ROLE_TEXT[memberRole])}</Styled.Role>
        </Styled.Item>
        <Styled.Item $dateJoined item sm={2} xs={2} $hideInMobile>
          <Styled.Date>{member?.joinDate ? dateUtil.formatMDYTime(member.joinDate) : '-'}</Styled.Date>
        </Styled.Item>
        <Styled.Item item sm={2} xs={2} $hideInMobile>
          <Styled.Date>{member?.lastActivity ? dateUtil.formatMDYTime(member.lastActivity) : '-'}</Styled.Date>
        </Styled.Item>
        <Styled.Item $makeRole container item sm={1} xs={1} justifyContent="flex-end">
          {member._id !== currentUser._id && (isOwner() || _isHigherRole(myRole, memberRole)) && (
            <Styled.PopperButton
              popperProps={{
                parentOverflow: 'viewport',
                placement: 'bottom-end',
                scrollWillClosePopper: true,
              }}
              renderPopperContent={_renderPopperContent}
            >
              <Icomoon className="more-v" size={14} color={Colors.NEUTRAL_60} />
            </Styled.PopperButton>
          )}
        </Styled.Item>
        {openTransferModal && (
          <MemberOrgRowTransferModal
            onClose={() => setOpenTransferModal(false)}
            onSave={() => handleSetMemberRole(ORGANIZATION_ROLES.ORGANIZATION_ADMIN)}
            member={member}
          />
        )}
      </Styled.Container>
    );
  }

  if (listToShow === ORGANIZATION_MEMBER_TYPE.MEMBER) {
    return (
      <Styled.Container container $disabled={isDeleting}>
        <Styled.Item item sm={4} xs={11}>
          <MemberItemBody listToShow={listToShow} member={member} currentUserId={currentUser._id} />
        </Styled.Item>
        <Styled.Item item sm={3} xs={3} $hideInMobile>
          <Styled.Role $role={member.role.toUpperCase()}>{t(ORGANIZATION_ROLE_TEXT[memberRole])}</Styled.Role>
        </Styled.Item>
        <Styled.Item item sm={4} xs={4} $hideInMobile>
          <Styled.Email>{member.email} </Styled.Email>
        </Styled.Item>
        <Styled.Item container item sm={1} xs={1} justifyContent="flex-end">
          {ORGANIZATION_ROLES.MEMBER !== myRole &&
            member._id !== currentUser._id &&
            (isOwner() || _isHigherRole(myRole, memberRole)) && (
              <Styled.PopperButton
                popperProps={{
                  parentOverflow: 'viewport',
                  scrollWillClosePopper: true,
                }}
                renderPopperContent={_renderPopperContent}
              >
                <Icomoon className="more-v" color={Colors.NEUTRAL_60} size={14} />
              </Styled.PopperButton>
            )}
        </Styled.Item>
        {openTransferModal && (
          <MemberOrgRowTransferModal
            onClose={() => setOpenTransferModal(false)}
            onSave={() => handleSetMemberRole(ORGANIZATION_ROLES.ORGANIZATION_ADMIN)}
            member={member}
          />
        )}
      </Styled.Container>
    );
  }
}

MemberOrgRow.propTypes = propTypes;
MemberOrgRow.defaultProps = defaultProps;

export default React.memo(MemberOrgRow);

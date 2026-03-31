/* eslint-disable no-use-before-define */
import { debounce, reject } from 'lodash';
import { Button, Collapse, Modal, PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Trans } from 'react-i18next';
import { batch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import IconGoogle from 'assets/lumin-svgs/icon-google.svg';

import MemberItem from 'lumin-components/MemberItem';
import ModalFooter from 'lumin-components/ModalFooter';
import SearchInput from 'lumin-components/Shared/SearchInput';
import UserResults from 'lumin-components/Shared/UserResults';
import MemberRoleOrganizationMenu from 'luminComponents/ReskinLayout/components/MemberRoleOrganizationMenu/MemberRoleOrganizationMenu';
import ScrollAreaAutoSize from 'luminComponents/ScrollAreaAutoSize';

import { useGetCurrentUser, useImportGoogleContacts, useLatestRef, useTrackingModalEvent, useTranslation } from 'hooks';
import usePaymentRouteMatch from 'hooks/usePaymentRouteMatch';

import { organizationServices, userServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils, errorUtils, orgUtil, validator } from 'utils';
import common from 'utils/common';
import {
  COMMON_FORM_INFO,
  FORM_INPUT_NAME,
  FORM_INPUT_PURPOSE,
} from 'utils/Factory/EventCollection/FormEventCollection';
import fromEvent from 'utils/Factory/EventCollection/FormEventCollection/FormEventCollection';
import { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import { OrganizationUtilities } from 'utils/Factory/Organization';
import { lazyWithRetry } from 'utils/lazyWithRetry';
import { PaymentUrlSerializer } from 'utils/payment';

import showContactCustomerSupportModal from 'features/CNC/helpers/showContactCustomerSupportModal';
import { useShowContactCustomerSupportModal } from 'features/CNC/hooks';
import InviteLink from 'features/InviteLink';
import { useFetchInviteLink } from 'features/InviteLink/hooks/useFetchInviteLink';
import useGetInviteLinkData from 'features/InviteLink/hooks/useGetInviteLinkData';

import { TOAST_DURATION_ERROR_INVITE_MEMBER } from 'constants/customConstant';
import { ErrorCode } from 'constants/errorCode';
import { FeatureFlags } from 'constants/featureFlagsConstant';
import {
  ModalTypes,
  STATUS_CODE,
  EntitySearchType,
  SearchUserStatus,
  DEBOUNCED_SEARCH_TIME,
} from 'constants/lumin-common';
import { WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER } from 'constants/messages';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { PERIOD, Plans } from 'constants/plan';
import { MAX_EMAIL_LENGTH } from 'constants/userConstants';

import { useInviteMember } from './hooks';
import { reducer, initialState } from './reducer';
import withAddMemberHOC from './withAddMemberHOC';

import * as Styled from './AddMemberOrganizationModal.styled';

import styles from './AddMemberOrganizationModal.module.scss';

const RequestToPayOrganizationModal = lazyWithRetry(() => import('lumin-components/RequestToPayOrganizationModal'));

AddMemberOrganizationModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  updateCurrentOrganization: PropTypes.func.isRequired,
  updateOrganizationInList: PropTypes.func.isRequired,
  currentOrganization: PropTypes.object,
  selectedOrganization: PropTypes.object,
  openLimitModal: PropTypes.func,
  openFailedModal: PropTypes.func,
  openModal: PropTypes.func.isRequired,
  openBlockedByUpgradingModal: PropTypes.func.isRequired,
  members: PropTypes.array,
  from: PropTypes.string,
};

AddMemberOrganizationModal.defaultProps = {
  currentOrganization: {},
  openLimitModal: () => {},
  openFailedModal: () => {},
  selectedOrganization: null,
  members: [],
  from: '',
};

function AddMemberOrganizationModal(props) {
  const {
    onClose,
    onSaved,
    currentOrganization: currentOrganizationProps,
    selectedOrganization,
    updateCurrentOrganization,
    updateOrganizationInList,
    openLimitModal,
    openFailedModal,
    openModal,
    openBlockedByUpgradingModal,
    members: membersProp,
    from,
  } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentOrganization = selectedOrganization || currentOrganizationProps;
  const { _id: orgId = '', payment = {}, totalMember = 0, userRole: inviterUserRole } = currentOrganization;
  const isManager = organizationServices.isManager(inviterUserRole);
  const { handleImportGoogleContacts, contacts } = useImportGoogleContacts(orgId);
  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization });
  const classes = Styled.useStyles();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [saving, setSaving] = useState(false);
  const currentOrganizationRef = useLatestRef(currentOrganization);
  const currentUser = useGetCurrentUser() || {};
  const { shouldOpenContactCustomerSupportModal } = useShowContactCustomerSupportModal({
    organization: currentOrganizationRef?.current,
    numberInvited: state?.members?.length,
  });

  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== previousPathRef.current) {
      onClose();
    }
  }, [location.pathname]);

  const remainingMembers = payment.quantity - totalMember;

  const currentPeriod = payment.period || PERIOD.MONTHLY;

  const totalMembersIncludeInviting = state.members.length + totalMember;

  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchMemberDebounced = useRef(debounce(onSearchTextChange, DEBOUNCED_SEARCH_TIME)).current;
  const currentEmail = useRef('');
  const membersRef = useRef(state.members);

  const { inviteLink, currentInviteLink } = useGetInviteLinkData();

  const isOldPlan = [Plans.ENTERPRISE, Plans.BUSINESS].includes(payment.type);
  const isPaymentRoute = usePaymentRouteMatch();

  const { trackModalDismiss } = useTrackingModalEvent({
    isOpen: true,
    modalName: ModalName.INVITE_CIRCLE_MEMBER,
    modalPurpose: ModalPurpose[ModalName.INVITE_CIRCLE_MEMBER],
  });

  const setMembers = (newMembers) => dispatch({ type: 'SET_MEMBERS', payload: { newMembers } });

  const setSelectedMember = (selectedMember) =>
    dispatch({ type: 'UPDATE_SELECTED_MEMBER', payload: { selectedMember } });

  const toggleRequestToPay = (showRequestToPay) =>
    dispatch({ type: 'TOGGLE_REQUEST_TO_PAY', payload: { showRequestToPay } });

  const canAddEmail = (email, status) =>
    !membersRef.current.some((memberRef) => memberRef.email === email) && status === SearchUserStatus.USER_VALID;

  const { inviteMemberGuard } = useInviteMember({
    totalMembers: totalMembersIncludeInviting,
    openMaxMemberModal: openLimitModal,
    hasReachedLimit: hasReachedLimit(),
    toggleRequestToPay,
    redirectUrl: getPaymentRedirectUrl(),
    currentOrganization,
  });

  const getNewMemberCount = () =>
    Math.max(totalMembersIncludeInviting - (orgUtilities.payment.isFree() ? 0 : payment.quantity), 0);

  function getPaymentRedirectUrl() {
    return new PaymentUrlSerializer()
      .of(orgId)
      .period(payment?.period || PERIOD.MONTHLY)
      .plan(Plans.BUSINESS)
      .quantityParam(totalMembersIncludeInviting)
      .returnUrlParam()
      .get();
  }

  const inviteMemberFailed = (err) => {
    const { code: errorCode, metadata } = errorUtils.extractGqlError(err);
    switch (errorCode) {
      case ErrorCode.Org.SCHEDULED_DELETE:
        openScheduledDeleteModal();
        break;

      case ErrorCode.Org.UPGRADING_INVOICE: {
        openBlockedByUpgradingModal(metadata);
        break;
      }

      case ErrorCode.Org.CANNOT_ADD_MEMBER_TO_ORGANIZATION: {
        toastUtils.warn({
          message: t(WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER),
        });
        onClose();
        break;
      }

      case ErrorCode.Org.ACTION_BLOCKED_BY_SCIM: {
        toastUtils.openScimBlockedErrorToast().finally(() => {});
        break;
      }

      default: {
        toastUtils.openUnknownErrorToast();
        break;
      }
    }
  };

  const inviteMember = async () => {
    try {
      setSaving(true);
      const transformDataToSend = (list) => list.map((item) => ({ _id: item._id, email: item.email, role: item.role }));
      const memberList = transformDataToSend(state.members);
      const { organization, statusCode, sameDomainEmails, notSameDomainEmails } =
        await organizationServices.inviteMemberToOrg({
          orgId,
          members: memberList,
        });
      batch(() => {
        updateCurrentOrganization(organization);
        updateOrganizationInList(orgId, organization);
      });
      switch (statusCode) {
        case STATUS_CODE.SUCCEED:
          if (sameDomainEmails.length && !notSameDomainEmails.length) {
            toastUtils.openToastMulti({
              type: ModalTypes.SUCCESS,
              message: t('memberPage.addMemberModal.membersHaveBeenAdded'),
            });
          } else if (sameDomainEmails.length && notSameDomainEmails.length) {
            toastUtils.openToastMulti({
              type: ModalTypes.SUCCESS,
              message: (
                <Trans
                  i18nKey="memberPage.addMemberModal.someAddedAndSomeInvited"
                  values={{ domain: common.getDomainFromEmail(sameDomainEmails[0]) }}
                  components={{ b: <b /> }}
                />
              ),
            });
          } else {
            toastUtils.openToastMulti({
              type: ModalTypes.SUCCESS,
              message: t('memberPage.addMemberModal.invitationHaveBeenSent'),
            });
          }
          break;
        case STATUS_CODE.BAD_REQUEST:
          toastUtils.openToastMulti({
            type: ModalTypes.WARNING,
            message: t(WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER),
            duration: TOAST_DURATION_ERROR_INVITE_MEMBER,
          });
          break;
        default:
          break;
      }
      toggleRequestToPay(false);
      onSaved();
    } catch (err) {
      const { code: errorCode } = errorUtils.extractGqlError(err);
      if (errorCode === ErrorCode.Org.CANNOT_INVITE_USER) {
        openModal({
          type: ModalTypes.WARNING,
          title: t('cannotInviteMemberModal.title'),
          message: t('cannotInviteMemberModal.message'),
          confirmButtonTitle: t('common.reload'),
          onConfirm: () => window.location.reload(),
          useReskinModal: true,
        });
        return;
      }
      inviteMemberFailed(err);
    } finally {
      if (shouldOpenContactCustomerSupportModal && from === FeatureFlags.MODAL_EXTRA_FREE_TRIAL_DAYS) {
        showContactCustomerSupportModal({
          numberInvited: state.members.length,
        });
      }
      setSaving(false);
    }
  };

  const handleChangeMemberRoleReskin = ({ role, user }) => {
    if (role === 'remove') {
      setMembers(state.members.filter((member) => member.email !== user.email));
    } else {
      setMembers(
        state.members.map((member) => {
          const newMember = { ...member };
          if (newMember.email === user.email) {
            newMember.role = role;
          }
          return newMember;
        })
      );
    }
    setSelectedMember({});
  };

  const filterAddedMemberList = (user) => membersRef.current.every((mem) => mem.email !== user.email);

  const injectDataToResults = (user) => ({
    ...user,
    disabled: user.status !== SearchUserStatus.USER_VALID,
  });

  const getId = (target) => target._id;

  async function searchMember(searchText) {
    const isEmail = validator.isEmail(searchText);
    const { _id: currentOrgId = '' } = currentOrganizationRef.current;
    if (isEmail) {
      try {
        setSearching(true);
        const searchResults = await userServices.findUser({
          targetId: currentOrgId,
          searchKey: searchText,
          targetType: EntitySearchType.ORGANIZATION,
          excludeUserIds: membersRef.current.map(getId),
        });
        currentEmail.current = searchText;
        setResults(searchResults.filter(filterAddedMemberList).map(injectDataToResults));
      } catch (error) {
        const { code: errorCode } = errorUtils.extractGqlError(error);
        if (errorCode === ErrorCode.User.UNAVAILABLE_USER) {
          setResults([{ email: searchText, status: SearchUserStatus.USER_UNAVAILABLE, disabled: true }]);
        } else {
          openFailedModal();
          logger.logError({ message: error.message, error });
          setResults([]);
        }
      } finally {
        setSearching(false);
      }
    }
    if (searchText && !validator.validateEmailLength(searchText)) {
      toastUtils.error({ message: t('errorMessage.maxLengthMessage', { length: MAX_EMAIL_LENGTH }) });
    }
  }

  async function onSearchTextChange(searchText) {
    fromEvent.formFieldChange({
      ...COMMON_FORM_INFO.inviteMember,
      fieldName: FORM_INPUT_NAME.INVITED_EMAIL,
      fieldPurpose: FORM_INPUT_PURPOSE[FORM_INPUT_NAME.INVITED_EMAIL],
    });
    searchMember(searchText);
  }

  const onMemberAdded = (addedMember) => {
    const { email: emailAddedMember, status: statusAddedMember } = addedMember;
    if (canAddEmail(emailAddedMember, statusAddedMember)) {
      const defaultRole =
        inviterUserRole.toUpperCase() === ORGANIZATION_ROLES.MEMBER
          ? ORGANIZATION_ROLES.MEMBER
          : ORGANIZATION_ROLES.BILLING_MODERATOR;
      setMembers([...membersRef.current, { ...addedMember, role: defaultRole }]);
      setResults((prevState) => reject(prevState, ['email', emailAddedMember]));
    }
  };

  function hasReachedLimit() {
    return (payment.quantity || 0) < totalMembersIncludeInviting;
  }

  const handleInviteMember = () => {
    const { shouldInvite } = inviteMemberGuard({ onCloseAddMemberModal: onCloseModal });
    if (shouldInvite) {
      inviteMember();
    }
  };

  const onRequestConfirm = async () => {
    if (currentPeriod === PERIOD.MONTHLY) {
      await inviteMember();
      return;
    }
    navigate(getPaymentRedirectUrl());
  };

  const renderRemainingSlot = () => {
    if (payment.type === Plans.ENTERPRISE || (payment.type === Plans.BUSINESS && currentPeriod === PERIOD.ANNUAL)) {
      return (
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
          {t('memberPage.addMemberModal.hasRemainSlot', { remainingMembers })}
        </Text>
      );
    }
    return '';
  };

  const openScheduledDeleteModal = () => {
    const { userRole, name: orgName, deletedAt } = currentOrganization;
    const onConfirm = () => organizationServices.reactiveOrganization(orgId, false);
    const setting = orgUtil.getScheduledDeleteOrgModalSettings({ userRole, orgName, deletedAt }, onConfirm);
    openModal(setting);
  };

  const onCloseModal = () => {
    onClose();
    trackModalDismiss();
  };

  const renderResult = useCallback((resultProps) => {
    const tooltip = {
      [SearchUserStatus.USER_ADDED]: t('memberPage.addMemberModal.userAdded'),
      [SearchUserStatus.USER_UNAVAILABLE]: t('memberPage.addMemberModal.userUnavailable'),
      [SearchUserStatus.USER_RESTRICTED]: t('memberPage.addMemberModal.userRestricted'),
    }[resultProps.data?.status];
    return (
      <PlainTooltip content={tooltip} maw="none" position="top" offset={-40}>
        <div>
          <UserResults {...resultProps} />
        </div>
      </PlainTooltip>
    );
  }, []);

  useEffect(() => {
    setMembers(membersProp);
  }, [membersProp]);

  useEffect(() => {
    membersRef.current = state.members;
  }, [state.members]);

  useEffect(() => {
    searchMember(currentEmail.current);
  }, [state.members.length]);

  const { isLoading: isLoadingInviteLink } = useFetchInviteLink({
    organizationData: currentOrganization,
    enable: currentInviteLink?.orgId !== currentOrganization._id,
  });

  useEffect(() => {
    if (contacts?.length) {
      const defaultRole =
        inviterUserRole.toUpperCase() === ORGANIZATION_ROLES.MEMBER
          ? ORGANIZATION_ROLES.MEMBER
          : ORGANIZATION_ROLES.BILLING_MODERATOR;
      setMembers(contacts.map((contact) => ({ ...contact, role: defaultRole })));
    }
  }, [contacts?.length]);

  const renderInviteFromGoogle = () => (
    <Button
      variant="outlined"
      size="lg"
      className={styles.inviteFromGoogleButton}
      onClick={handleImportGoogleContacts}
      startIcon={<Styled.Logo src={IconGoogle} width={24} height={24} />}
    >
      Google
    </Button>
  );

  const renderDescription = () => (
    <div className={styles.descriptionWrapper}>
      <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
        {t('inviteCollaboratorsModal.activatedFreeTrial')}
      </Text>
      <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
        {t('inviteCollaboratorsModal.selectInvite')}
      </Text>
    </div>
  );

  return (
    <Modal
      opened
      onClose={onCloseModal}
      size="md"
      backButtonProps={{ onClick: onCloseModal }}
      classNames={{ content: styles.modalContent }}
      closeOnEscape={!isPaymentRoute}
      closeOnClickOutside={!isPaymentRoute}
    >
      <div className={styles.titleWrapper}>
        <Text type="headline" size="lg">
          {t('memberPage.inviteCollaborators')}
        </Text>
        {isPaymentRoute && renderDescription()}
        {renderRemainingSlot()}
      </div>
      <div>
        <Collapse in={!isLoadingInviteLink && (isManager || inviteLink) && !isOldPlan} data-cy="invite_link_collapse">
          <InviteLink organization={currentOrganization} />
          <Text
            type="title"
            size="md"
            color="var(--kiwi-colors-surface-on-surface)"
            className={styles.inviteMemberText}
          >
            {t('memberPage.inviteByEmail')}
          </Text>
        </Collapse>
        <div>
          <SearchInput
            onChange={searchMemberDebounced}
            options={results}
            onSelect={onMemberAdded}
            resultComponent={renderResult}
            autoFocus
            loading={searching}
            placeholder={t('modalShare.enterEmailAddres')}
            isReskin
          />
          {state.members.length > 0 && (
            <div className={styles.memberListWrapper}>
              <ScrollAreaAutoSize
                classNames={{
                  viewport: styles.viewport,
                }}
                scrollbars="y"
                offsetScrollbars="x"
                mah={250}
                onScrollPositionChange={() => setSelectedMember({})}
              >
                {state.members.map((member) => (
                  <MemberItem
                    className={classes.itemMember}
                    key={member.email}
                    user={member}
                    isMe={member._id === currentUser._id}
                    moreRightElement
                    active={state.selectedMember.email === member.email}
                    isReskin
                    rightElement={
                      <MemberRoleOrganizationMenu
                        open={member.email === state.selectedMember.email}
                        onChangeRole={handleChangeMemberRoleReskin}
                        currentRole={member.role}
                        user={member}
                        onSelect={() => setSelectedMember(member)}
                        onClose={() => setSelectedMember({})}
                        inviterUserRole={inviterUserRole}
                      />
                    }
                  />
                ))}
              </ScrollAreaAutoSize>
            </div>
          )}
        </div>
      </div>
      <ModalFooter
        onSubmit={handleInviteMember}
        disabled={state.members.length === 0}
        onCancel={onCloseModal}
        label={t('memberPage.invite')}
        loading={saving}
        isReskin
        renderLeftElement={renderInviteFromGoogle()}
        cancelButtonProps={{
          variant: 'text',
        }}
        extraSpacing
        cancelButtonLabel={isPaymentRoute ? t('common.maybeLater') : ''}
      />
      {state.showRequestToPay && (
        <RequestToPayOrganizationModal
          selectedOrganization={currentOrganization}
          onCancel={() => toggleRequestToPay(false)}
          getNewMemberCount={getNewMemberCount}
          onConfirm={onRequestConfirm}
        />
      )}
    </Modal>
  );
}

export default withAddMemberHOC(AddMemberOrganizationModal);

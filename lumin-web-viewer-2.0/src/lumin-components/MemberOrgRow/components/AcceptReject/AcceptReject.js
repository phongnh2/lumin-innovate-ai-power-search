import classNames from 'classnames';
import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';

import { useIsMountedRef, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils, errorUtils } from 'utils';
import errorExtract from 'utils/error';
import { OrganizationUtilities } from 'utils/Factory/Organization';

import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_MAX_MEMBERS } from 'constants/organizationConstants';
import { PERIOD } from 'constants/plan';
import { Colors } from 'constants/styles';

import { openLimitedOrgMembersModal, openEnterpriseLimitationModal } from '../../helpers';
import * as Styled from '../../MemberOrgRow.styled';
import styles from '../ActionButton/ActionButton.module.scss';

const AcceptReject = ({
  isReskin,
  member,
  refetchList,
  totalMember,
  setShowRequestToPay,
  redirectUrl,
  addMemberToOrganization,
  handleErrorUserNotFound,
}) => {
  const { t } = useTranslation();
  const isMounted = useIsMountedRef();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const [rejecting, setRejecting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const dispatch = useDispatch();
  const openModal = useCallback((modalSettings) => dispatch(actions.openModal(modalSettings)), [dispatch]);
  const navigate = useNavigate();
  const { _id: orgId, payment, name: orgName } = currentOrganization.data || {};
  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization.data });
  const hasReachedLimit = (payment?.quantity || 0) < totalMember + 1;
  const loading = accepting || rejecting;

  function displayRequestToPayModal() {
    if (payment.period === PERIOD.MONTHLY) {
      setShowRequestToPay(true);
    } else {
      openModal({
        type: ModalTypes.WARNING,
        title: t('memberPage.orgHasReachedlimit'),
        message: t('memberPage.messageOrgHasReachedlimit', { quantity: payment.quantity }),
        confirmButtonTitle: t('common.upgrade'),
        onCancel: () => {},
        onConfirm: () => navigate(redirectUrl),
      });
    }
  }

  const addMemberGuard = () => {
    if (
      !orgUtilities.payment.isEnterprise() &&
      !orgUtilities.hasUnlimitedMember() &&
      totalMember >= ORGANIZATION_MAX_MEMBERS
    ) {
      openLimitedOrgMembersModal({ openModal, orgName });
      return {
        hasBlocked: true,
      };
    }

    if (orgUtilities.payment.isEnterprise() && hasReachedLimit) {
      openEnterpriseLimitationModal({
        openModal,
        maximumMembers: payment?.quantity,
      });
      return {
        hasBlocked: true,
      };
    }

    if (orgUtilities.payment.isBusiness() && hasReachedLimit) {
      displayRequestToPayModal();
      return {
        hasBlocked: true,
      };
    }

    return {
      hasBlocked: false,
    };
  };

  const handleAccept = async (userId) => {
    const { hasBlocked } = addMemberGuard();
    if (hasBlocked) {
      return;
    }
    try {
      setAccepting(true);
      await addMemberToOrganization(userId);
    } finally {
      isMounted.current && setAccepting(false);
    }
  };

  const handleReject = async (userId) => {
    try {
      setRejecting(true);
      await organizationServices.rejectRequestingAccess({ orgId, userId });
      await refetchList();
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('memberPage.requesterHasBeenRejected'),
      });
    } catch (err) {
      const { code } = errorExtract.extractGqlError(err);
      handleErrorUserNotFound(code);
      logger.logError({ error: err });
      errorUtils.handleScimBlockedError(err);
    } finally {
      isMounted.current && setRejecting(false);
    }
  };

  if (isReskin) {
    return (
      <div className={classNames(styles.wrapper, styles.withButtons)}>
        <Button
          className={loading && styles.noActions}
          data-cy="reject_requesting_access"
          variant="text"
          colorType="error"
          loading={rejecting}
          disabled={rejecting}
          onClick={() => !loading && handleReject(member._id)}
        >
          {t('common.reject')}
        </Button>
        <Button
          className={loading && styles.noActions}
          data-cy="accept_requesting_access"
          variant="text"
          colorType="info"
          loading={accepting}
          disabled={accepting}
          onClick={() => !loading && handleAccept(member._id)}
        >
          {t('common.accept')}
        </Button>
      </div>
    );
  }

  return (
    <Styled.ButtonWrapper>
      <Styled.ButtonReject
        onClick={() => handleReject(member._id)}
        size={ButtonSize.XS}
        color={ButtonColor.HYPERLINK}
        labelColor={Colors.SECONDARY_50}
        loading={rejecting}
        disabled={loading}
      >
        {t('common.reject')}
      </Styled.ButtonReject>
      <Styled.ButtonAccept
        loading={accepting}
        onClick={() => handleAccept(member._id)}
        size={ButtonSize.XS}
        color={ButtonColor.HYPERLINK}
        labelColor={Colors.SUCCESS_50}
        disabled={loading}
      >
        {t('common.accept')}
      </Styled.ButtonAccept>
    </Styled.ButtonWrapper>
  );
};

AcceptReject.propTypes = {
  isReskin: PropTypes.bool,
  member: PropTypes.object.isRequired,
  refetchList: PropTypes.func.isRequired,
  totalMember: PropTypes.number.isRequired,
  setShowRequestToPay: PropTypes.func.isRequired,
  redirectUrl: PropTypes.string.isRequired,
  addMemberToOrganization: PropTypes.func.isRequired,
  handleErrorUserNotFound: PropTypes.func.isRequired,
};

AcceptReject.defaultProps = {
  isReskin: false,
};

export default AcceptReject;

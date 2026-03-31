import { useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { documentServices, organizationServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';
import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import OrganizationTracking from 'features/CNC/tracking/organization';

import { JOIN_ORGANIZATION_STATUS } from 'constants/organizationConstants';

import {
  IOrganization,
  JoinOrganizationStatus,
  SuggestedOrganization,
} from 'interfaces/organization/organization.interface';

import showJoinedOrganizationModal from '../helpers/showJoinedOrganizationModal';

type Params = {
  organization: SuggestedOrganization;
  trackModalConfirmation: () => Promise<void>;
  updateOrgStatusInList: ({ orgId, status }: { orgId: string; status: JoinOrganizationStatus }) => void;
  documentId: string;
  onSkip: () => void;
};

const useJoinOrganization = ({
  organization,
  trackModalConfirmation,
  updateOrgStatusInList,
  documentId,
  onSkip,
}: Params) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const mainOrganization = useSelector(selectors.getMainOrganizationCanJoin, shallowEqual);
  const isActionToSameDomainOrg = mainOrganization._id === organization._id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const updateList = ({ orgId, status }: { orgId: string; status: JoinOrganizationStatus }) => {
    updateOrgStatusInList({ orgId, status });
  };

  const updateJoinSuccessfully = ({
    selectedOrganization,
    joinType,
  }: {
    selectedOrganization: IOrganization;
    joinType: JoinOrganizationStatus;
  }) => {
    updateList({ orgId: selectedOrganization._id, status: JoinOrganizationStatus.JOINED });
    OrganizationTracking.selectSuggestedPremiumOrganization({
      selectedOrganization,
      selectedOrganizationJoinType: joinType,
    }).catch(() => {});
    dispatch(actions.addNewOrganization(selectedOrganization));
    if (isActionToSameDomainOrg) {
      dispatch(actions.removeMainOrganizationCanRequest());
    }
  };

  const uploadDocument = async ({ selectedOrganization }: { selectedOrganization: IOrganization }) => {
    const currentDocument = await documentServices.getDocumentById(documentId);
    await documentServices.uploadDocumentFromDrive({
      document: currentDocument,
      orgId: selectedOrganization._id,
    });
    dispatch(actions.setCurrentOrganization(selectedOrganization));
    navigate(getDefaultOrgUrl({ orgUrl: selectedOrganization.url }), { replace: true });
    onSkip();
    dispatch(actions.setShowTrialModal(false));
    showJoinedOrganizationModal({ organization: selectedOrganization, dispatch });
  };

  const acceptOrganizationInvitation = async ({ orgId }: { orgId: string }) => {
    const { organization: selectedOrganization } = await organizationServices.acceptOrganizationInvitation({ orgId });
    updateJoinSuccessfully({ selectedOrganization, joinType: JoinOrganizationStatus.PENDING_INVITE });
    await uploadDocument({ selectedOrganization });
  };

  const joinOrganization = async ({ orgId }: { orgId: string }) => {
    const { organization: selectedOrganization } = await organizationServices.joinOrganization({ orgId });
    updateJoinSuccessfully({ selectedOrganization, joinType: JoinOrganizationStatus.CAN_JOIN });
    await uploadDocument({ selectedOrganization });
  };

  const sendRequestJoinOrg = async ({ orgId }: { orgId: string }) => {
    const { orgData: selectedOrganization } = await organizationServices.sendRequestJoinOrg({ orgId });
    updateList({ orgId, status: JoinOrganizationStatus.REQUESTED });
    OrganizationTracking.selectSuggestedPremiumOrganization({
      selectedOrganization,
      selectedOrganizationJoinType: JoinOrganizationStatus.CAN_REQUEST,
    }).catch(() => {});
    if (isActionToSameDomainOrg) {
      dispatch(actions.updateStatusRequestMainOrganization(JOIN_ORGANIZATION_STATUS.REQUESTED));
    }
    toastUtils.success({ message: t('requestSubmitted.title') });
  };

  const onClick = async () => {
    trackModalConfirmation().catch(() => {});
    setIsSubmitting(true);
    const { _id: orgId, status } = organization;
    try {
      switch (status) {
        case JoinOrganizationStatus.CAN_REQUEST: {
          await sendRequestJoinOrg({ orgId });
          break;
        }
        case JoinOrganizationStatus.CAN_JOIN: {
          await joinOrganization({ orgId });
          break;
        }
        case JoinOrganizationStatus.PENDING_INVITE: {
          await acceptOrganizationInvitation({ orgId });
          break;
        }
        default:
          break;
      }
    } catch (err) {
      const { message } = errorUtils.extractGqlError(err) as { message: string; code: string };
      logger.logError({ message, error: err });
      errorUtils.handleScimBlockedError(err);
    } finally {
      setIsSubmitting(false);
      if (status === JoinOrganizationStatus.CAN_REQUEST) {
        onSkip();
      }
    }
  };

  return { onClick, isSubmitting };
};

export { useJoinOrganization };

import { useCallback, useEffect, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import paymentService from 'services/paymentService';

import getOrgIdOfDoc from 'helpers/getOrgIdOfDoc';

import { ACCOUNTABLE_BY } from 'constants/documentConstants';
import { ORG_TEXT } from 'constants/organizationConstants';
import { BillingWarningType } from 'constants/paymentConstant';
import { PaymentTypes } from 'constants/plan';

const CLOSABLE_WARNING = {
  [BillingWarningType.RENEW_ATTEMPT]: false,
  [BillingWarningType.UNPAID_SUBSCRIPTION]: false,
  [BillingWarningType.SUBSCRIPTION_REMAINING_DATE]: true,
};

const WARNING_PRIORITY = {
  [BillingWarningType.SUBSCRIPTION_REMAINING_DATE]: 2,
  [BillingWarningType.UNPAID_SUBSCRIPTION]: 3,
  [BillingWarningType.RENEW_ATTEMPT]: 4,
};

export default function useCurrentBillingClient() {
  const [targetId, setTargetId] = useState(null);
  const [targetType, setTargetType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch();
  const isOffline = useSelector(selectors.isOffline);
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data;
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual) || {};
  const billingWarning = useSelector(selectors.getBillingWarning, shallowEqual);
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);

  const documentId = currentDocument?._id;
  const { _id: currentOrganizationId } = currentOrganization || {};

  const getClient = useCallback(async () => {
    let clientId = currentUser._id;
    let type = PaymentTypes.INDIVIDUAL;
    const orgMatched = matchPath({ path: `/${ORG_TEXT}/:url`, end: false }, location.pathname);
    if (orgMatched) {
      clientId = currentOrganizationId;
      type = PaymentTypes.ORGANIZATION;
    }
    const viewerMatched = matchPath({ path: '/viewer/:documentId' }, location.pathname);
    if (viewerMatched) {
      if (currentDocument?.isShared) {
        return { clientId: null, type: null };
      }
      const { accountableBy } = currentDocument?.documentReference || {};
      if (!accountableBy) {
        return { clientId: null, type: null };
      }
      const belongToOrganization = accountableBy === ACCOUNTABLE_BY.ORGANIZATION;
      if (belongToOrganization) {
        clientId = getOrgIdOfDoc({ currentDocument });
        return { clientId, type: PaymentTypes.ORGANIZATION };
      }
      return { clientId: currentUser._id, type: PaymentTypes.INDIVIDUAL };
    }
    return {
      clientId,
      type,
    };
  }, [currentOrganizationId, currentUser._id, currentDocument, location.pathname]);

  const transformWarnings = (warnings = []) => {
    const list = warnings.map((type) => {
      const closable = CLOSABLE_WARNING[type];
      return {
        type,
        closable,
      };
    });
    list.sort((a, b) => WARNING_PRIORITY[a.type] - WARNING_PRIORITY[b.type]);
    return list;
  };

  const refetch = useCallback(
    async (id, type, options) => {
      const { skippedWarnings = [] } = options || {};
      try {
        if (isOffline) {
          return;
        }
        const data = await paymentService.getBillingWarning(id, type);
        const transformedWarnings = transformWarnings(data.warnings);
        dispatch(
          actions.setBillingWarning(id, {
            ...data,
            warnings: skippedWarnings.length
              ? transformedWarnings.filter(({ type }) => !skippedWarnings.includes(type))
              : transformedWarnings,
          })
        );
        // eslint-disable-next-line no-empty
      } catch (error) {}
    },
    [isOffline]
  );

  const updateClient = async () => {
    const { clientId, type } = await getClient();
    unstable_batchedUpdates(() => {
      setTargetId(clientId);
      setTargetType(type);
    });
  };

  const getBillingWarning = async () => {
    if (!(typeof billingWarning?.[targetId] === 'undefined' && targetId && targetType)) {
      return;
    }
    await refetch(targetId, targetType);
  };

  const checkHasWarning = useCallback(
    (clientId, warningType = null) => {
      const { warnings = [] } = billingWarning?.[clientId] || {};
      return !warningType
        ? Boolean(warnings.length)
        : Boolean(warnings.filter((item) => item.type === warningType).length);
    },
    [billingWarning]
  );

  useEffect(() => {
    updateClient();
  }, [location.pathname, documentId, currentOrganizationId, currentDocument]);

  useEffect(() => {
    if (targetId) {
      getBillingWarning().finally(() => setIsLoading(false));
    }
  }, [targetId]);

  return {
    targetId,
    targetType,
    refetch,
    checkHasWarning,
    isLoading,
  };
}

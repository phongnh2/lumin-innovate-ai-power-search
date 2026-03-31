import { useEffect, Dispatch, SetStateAction } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import selectors from 'selectors';

import { Plans } from 'constants/plan';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { Nullable } from 'interfaces/common';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { AvailablePaidOrganiations } from 'interfaces/redux/organization.redux.interface';

import { useGetCurrentUser } from './useGetCurrentUser';
import useMatchPaymentRoute from './useMatchPaymentRoute';

type BillingInfo = {
  organizationId: string;
};

type Props = {
  setBillingInfo: Dispatch<SetStateAction<BillingInfo>>;
};

const getRandomInt = (x: number, y: number) => Math.floor(Math.random() * (y - x + 1)) + x;

const useSetInitialOrgPaymentPage = ({ setBillingInfo }: Props): void => {
  const { plan, targetUrl } = useMatchPaymentRoute();

  const currentUser = useGetCurrentUser();
  const isLoadingOrganizationList = useSelector(selectors.isLoadingOrganizationList);
  const availablePaidOrgs = useSelector<unknown, AvailablePaidOrganiations>(selectors.availablePaidOrgs, shallowEqual);
  const targetOrg = availablePaidOrgs.find((org) => org.organization._id === targetUrl)?.organization;
  const hasOnePaidOrg = availablePaidOrgs.length === 1;
  const firstAvailablePaidOrg = hasOnePaidOrg ? availablePaidOrgs[0].organization : null;

  const isOldPlanPage = plan === Plans.BUSINESS;

  const [searchParams, setSearchParams] = useSearchParams();

  const getPreSelectedOrgId = () => {
    const { migratedOrgUrl, lastAccessedOrgUrl: _lastAccessedOrgUrl } = currentUser;
    const lastAccessedOrgUrl = migratedOrgUrl || _lastAccessedOrgUrl;
    if (!availablePaidOrgs.length) {
      return null;
    }
    const randomPaidOrg = availablePaidOrgs[getRandomInt(0, availablePaidOrgs.length - 1)]?.organization;
    const lastAccessedPaidOrg = availablePaidOrgs.find(
      ({ organization }) => organization.url === lastAccessedOrgUrl
    )?.organization;
    return lastAccessedPaidOrg?._id || randomPaidOrg?._id || null;
  };

  const changeOrganizationId = (organizationId: Nullable<string>): void => {
    setBillingInfo((prev) => ({
      ...prev,
      organizationId,
    }));
  };

  const getOrgIdByPlan = (org: IOrganization): Nullable<string> => {
    const isOldPlan = org.payment.type === Plans.BUSINESS;

    if (isOldPlanPage) {
      return isOldPlan ? org._id : null;
    }

    return org._id;
  };

  const getInitialPaidOrgId = (): Nullable<string> => {
    if (targetUrl) {
      if (!targetOrg || (isOldPlanPage && targetOrg && targetOrg.payment.type !== Plans.BUSINESS)) {
        searchParams.delete(UrlSearchParam.PAYMENT_ORG_TARGET);
        setSearchParams(searchParams);
        return '';
      }

      return getOrgIdByPlan(targetOrg);
    }

    if (firstAvailablePaidOrg) {
      searchParams.set(UrlSearchParam.PAYMENT_ORG_TARGET, firstAvailablePaidOrg._id);
      setSearchParams(searchParams, { replace: true });
      return getOrgIdByPlan(firstAvailablePaidOrg);
    }

    const preSelectedOrgId = getPreSelectedOrgId();
    if (preSelectedOrgId) {
      searchParams.set(UrlSearchParam.PAYMENT_ORG_TARGET, preSelectedOrgId);
      setSearchParams(searchParams, { replace: true });
    }

    return preSelectedOrgId;
  };

  useEffect(() => {
    if (!isLoadingOrganizationList) {
      changeOrganizationId(getInitialPaidOrgId());
    }
  }, [isLoadingOrganizationList, targetOrg?._id, firstAvailablePaidOrg?._id]);
};

export default useSetInitialOrgPaymentPage;

import { useNavigate } from 'react-router';

import { getLanguageFromUrl } from 'utils/getLanguage';

import { PaymentPlans } from 'constants/plan.enum';
import { Routers } from 'constants/Routers';
import { BASEURL } from 'constants/urls';

import useGetCurrentUser from './useGetCurrentUser';
import useGetOrganizationList from './useGetOrganizationList';

type GoToOrgListOrPersonalDocsProps = {
  forceReload?: boolean;
  goToPersonalDocs?: boolean;
};

type Payload = {
  goToOrgListOrPersonalDocs: (props?: GoToOrgListOrPersonalDocsProps) => void;
};

export default function useNavigateUser(): Payload {
  const navigate = useNavigate();
  const currentUser = useGetCurrentUser();
  const { organizationList } = useGetOrganizationList();

  const handleNavigate = (route: string, forceReload: boolean): void => {
    if (forceReload) {
      const languageUrl = getLanguageFromUrl();
      const url = [BASEURL, languageUrl ? `/${languageUrl}` : '', route].join('');
      window.location.replace(url);
    } else {
      navigate(route);
    }
  };

  const goToOrgListOrPersonalDocs = ({
    forceReload = false,
    goToPersonalDocs = false,
  }: GoToOrgListOrPersonalDocsProps = {}): void => {
    const hasActiveOrg = organizationList.some((org) => !org.organization.deletedAt);
    const isPremiumUser = currentUser.payment.type !== PaymentPlans.FREE;
    if (goToPersonalDocs || (!hasActiveOrg && isPremiumUser)) {
      handleNavigate(Routers.PERSONAL_DOCUMENT, forceReload);
      return;
    }
    handleNavigate(Routers.ORGANIZATION_LIST, forceReload);
  };

  return {
    goToOrgListOrPersonalDocs,
  };
}

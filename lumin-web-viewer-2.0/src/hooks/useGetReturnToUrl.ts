import validators from 'utils/validator';

import { ORG_TEXT } from 'constants/organizationConstants';
import { AGREEMENT_GEN_APP_URL, BANANA_SIGN_WEB_URL } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { useUrlSearchParams } from './useUrlSearchParams';

const useGetReturnToUrl = () => {
  const searchParams = useUrlSearchParams();
  const returnTo = decodeURIComponent(searchParams.get(UrlSearchParam.RETURN_TO) || '');

  const isReturnToValid = validators.validateWhitelistUrl(returnTo);
  if (!isReturnToValid) {
    return {};
  }

  const isLuminSign = returnTo.startsWith(BANANA_SIGN_WEB_URL);
  const luminSignDashboardUrl = (orgUrl: string) => `${BANANA_SIGN_WEB_URL}/${ORG_TEXT}/${orgUrl}/dashboard`;

  const isAgreementGen = returnTo.startsWith(AGREEMENT_GEN_APP_URL);
  const agreementGenUrl = (orgUrl: string) => {
    const returnToUrl = new URL(returnTo);
    const returnToSearchParams = new URLSearchParams(returnToUrl.search);
    if (returnToSearchParams.has('guest')) {
      returnToSearchParams.delete('guest');
    }

    const _searchParams = returnToSearchParams.size ? `?${returnToSearchParams.toString()}` : '';
    return `${AGREEMENT_GEN_APP_URL}/workspace/${orgUrl}/documents/personal${_searchParams}`;
  };

  return { isLuminSign, luminSignDashboardUrl, isAgreementGen, agreementGenUrl };
};

export default useGetReturnToUrl;

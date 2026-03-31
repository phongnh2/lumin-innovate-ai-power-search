import { useParams } from 'react-router';

import { getLanguage } from 'utils/getLanguage';

import { MARKETING_SLUGS, MARKETING_SLUG_VALUES } from 'constants/Routers';

import useGetOrganizationList from './useGetOrganizationList';
import useLastAccessOrg from './useLastAccessOrg';

const useTransformMarketingUrl = (): { url: string | null; isLoading: boolean } => {
  const { orgName } = useParams();

  const { loading: isLoadingOrgList } = useGetOrganizationList();

  const lastAccessedOrgUrl = useLastAccessOrg();

  const hasMarketingSlug = MARKETING_SLUG_VALUES.includes(orgName);

  const buildUrl = (url: URL) => {
    const language = getLanguage();
    const pathname = url.pathname.replace(`/${language.toLowerCase()}`, '');
    return `${pathname}${url.search}${url.hash}`;
  };

  const getTransformedUrl = () => {
    if (!orgName || !hasMarketingSlug) {
      return null;
    }
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (orgName) {
      case MARKETING_SLUGS.LAST_ACCESSED: {
        if (!lastAccessedOrgUrl) {
          return null;
        }
        const currentUrl = new URL(window.location.href);
        currentUrl.pathname = currentUrl.pathname.replace(`${MARKETING_SLUGS.LAST_ACCESSED}`, `${lastAccessedOrgUrl}`);
        return buildUrl(currentUrl);
      }
      default:
        return null;
    }
  };

  return {
    url: getTransformedUrl(),
    isLoading: hasMarketingSlug ? isLoadingOrgList : false,
  };
};

export default useTransformMarketingUrl;

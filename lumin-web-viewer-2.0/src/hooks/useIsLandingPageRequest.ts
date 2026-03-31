import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { PdfActionType } from 'features/EnableToolFromQueryParams/type';

import { UrlSearchParam } from 'constants/UrlSearchParam';

import { useUrlSearchParams } from './useUrlSearchParams';

const useIsLandingPageRequest = () => {
  const searchParams = useUrlSearchParams();
  const actionQuery = searchParams.get(UrlSearchParam.ACTION);

  return {
    isLandingPageRequest: Object.values(PdfAction).includes(actionQuery as PdfActionType),
  };
};

export default useIsLandingPageRequest;

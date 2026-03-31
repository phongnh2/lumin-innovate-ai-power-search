import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { PdfActionType } from 'features/EnableToolFromQueryParams/type';

import { UrlSearchParam } from 'constants/UrlSearchParam';

export const isLandingPageRequest = (): boolean => {
  const searchParams = new URLSearchParams(window.location.search);
  const actionQuery = searchParams.get(UrlSearchParam.ACTION);
  return Object.values(PdfAction).includes(actionQuery as PdfActionType);
};

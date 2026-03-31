import { Location } from 'react-router';

import { DocumentViewerOpenFrom } from 'utils/Factory/EventCollection/constants/DocumentEvent';

import { isTemplateViewerRouteMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import { UrlSearchParam } from 'constants/UrlSearchParam';

const isOpenFromDrive = (location: Location): boolean => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.has(UrlSearchParam.CREDENTIALS_ID);
};

export const getOpenFromState = (location: Location): string => {
  const isTemplateViewer = isTemplateViewerRouteMatch(location.pathname);

  if (isTemplateViewer) {
    return DocumentViewerOpenFrom.TEMPLATE;
  }
  const { openFrom = DocumentViewerOpenFrom.OTHERS } = (location.state || {}) as {
    openFrom: string;
  };

  const searchParams = new URLSearchParams(location.search);
  const openFromQueryParam = searchParams.get(UrlSearchParam.OPEN_FROM);

  return isOpenFromDrive(location) ? DocumentViewerOpenFrom.OPEN_GOOGLE : openFromQueryParam ?? openFrom;
};

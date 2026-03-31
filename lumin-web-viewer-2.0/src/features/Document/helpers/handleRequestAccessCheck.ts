import queryString from 'query-string';
import { NavigateFunction } from 'react-router';

import { kratosService } from 'services/oryServices';
import { KratosRoutes } from 'services/oryServices/kratos';

import { Routers } from 'constants/Routers';
import { BASEURL } from 'constants/urls';

import { IUser } from 'interfaces/user/user.interface';

type RequestAccessParams = {
  match: { params: { documentId: string } };
  navigate: NavigateFunction;
  currentUser: IUser;
  isTemplateViewer: boolean;
};

export default function handleRequestAccessCheck({ match, navigate, currentUser, isTemplateViewer }: RequestAccessParams): void {
  const { requesterId, from, referer } = queryString.parse(window.location.search);
  const { documentId } = match.params;
  if (currentUser) {
    const formatedQuery = {
      docId: documentId,
      from,
    };
    const requestAccessUrl = isTemplateViewer
      ? `${Routers.REQUEST_ACCESS_TEMPLATE}?${queryString.stringify(formatedQuery)}`
      : `${Routers.REQUEST_ACCESS}?${queryString.stringify(formatedQuery)}`;
    return navigate(requestAccessUrl, { replace: true });
  }

  let queryParams: string;

  if (requesterId) {
    queryParams = queryString.stringify({
      requesterId,
      action: 'request_access',
      from,
    });
  } else {
    queryParams = queryString.stringify({
      referer,
      from,
    });
  }

  const continueUrl = isTemplateViewer ? `/template/${documentId}?${queryParams}` : `/viewer/${documentId}?${queryParams}`;

  return kratosService.toKratos(KratosRoutes.SIGN_IN, { url: `${BASEURL}${continueUrl}` });
}

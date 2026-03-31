import { DOCUMENT_TYPE } from 'constants/documentConstants';

export function useGetFolderQueryParams(currentType, selectedClientId) {
  let param = '';
  switch (currentType) {
    case DOCUMENT_TYPE.ORGANIZATION:
      param = 'orgId';
      break;
    case DOCUMENT_TYPE.ORGANIZATION_TEAM:
      param = 'teamId';
      break;
    default:
      break;
  }
  return param ? { [param]: selectedClientId } : {};
}

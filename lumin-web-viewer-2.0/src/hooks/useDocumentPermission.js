import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import getCurrentRole from 'helpers/getCurrentRole';

import { getDocumentRoleIndex } from 'utils/permission';

import { DocumentRole } from 'constants/documentConstants';

export const useDocumentPermission = (document) => {
  const roleOfDocument = getCurrentRole(document);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  return {
    canShare: getDocumentRoleIndex(roleOfDocument) <= getDocumentRoleIndex(DocumentRole.SHARER),
    canEdit: getDocumentRoleIndex(roleOfDocument) <= getDocumentRoleIndex(DocumentRole.EDITOR),
    canComment: getDocumentRoleIndex(roleOfDocument) <= getDocumentRoleIndex(DocumentRole.VIEWER) && currentUser,
  };
};

export default useDocumentPermission;

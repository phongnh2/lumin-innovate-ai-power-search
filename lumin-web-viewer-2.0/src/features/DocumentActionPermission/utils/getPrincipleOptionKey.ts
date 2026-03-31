import { DocumentActionPermissionPrinciple, PrincipleCompoundKey } from '../constants/permissionRole.constant';
import { DocumentActionPermissionPrincipleType } from '../types/permissionRole.type';

export const getPrincipleOptionKey = (principleList: DocumentActionPermissionPrincipleType[]) => {
  if (
    !principleList?.length ||
    (principleList.length === 1 && principleList[0] === DocumentActionPermissionPrinciple.ANYONE)
  ) {
    return PrincipleCompoundKey.ANYONE;
  }

  const hasSharer = principleList.includes(
    DocumentActionPermissionPrinciple.SHARER as DocumentActionPermissionPrincipleType
  );
  const hasEditor = principleList.includes(
    DocumentActionPermissionPrinciple.EDITOR as DocumentActionPermissionPrincipleType
  );
  const hasViewer = principleList.includes(
    DocumentActionPermissionPrinciple.VIEWER as DocumentActionPermissionPrincipleType
  );

  if (hasSharer && hasEditor && hasViewer) {
    return PrincipleCompoundKey.SHARERS_EDITORS_AND_COMMENTERS;
  }

  if (hasSharer && hasEditor) {
    return PrincipleCompoundKey.SHARERS_AND_EDITORS;
  }

  return null;
};

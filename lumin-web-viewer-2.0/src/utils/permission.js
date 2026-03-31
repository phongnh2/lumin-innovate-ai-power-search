import { DocumentRole } from 'constants/documentConstants';

const documentRoles = Object.values(DocumentRole);

export const getDocumentRoleIndex = (role) =>
  documentRoles.findIndex((documentRole) => documentRole === role.toLowerCase());

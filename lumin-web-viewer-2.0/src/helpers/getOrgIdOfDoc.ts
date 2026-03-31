import { IDocumentBase } from 'interfaces/document/document.interface';
import { DOCUMENT_TYPE } from 'constants/documentConstants';

interface IGetOrgIdOfDocParams {
  currentDocument: IDocumentBase;
}

const getOrgIdOfDoc = ({ currentDocument }: IGetOrgIdOfDocParams): string => {
  if (!currentDocument || !currentDocument.belongsTo) {
    return null;
  }

  const { type, workspaceId, location } = currentDocument.belongsTo;
  switch (type) {
    case DOCUMENT_TYPE.PERSONAL: {
      return workspaceId;
    }
    case DOCUMENT_TYPE.ORGANIZATION: {
      return location._id;
    }
    case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
      return location.ownedOrgId;
    }
    default:
      return null;
  }
};

export default getOrgIdOfDoc;

import * as templateGraph from 'services/graphServices/template';

import { IBasicResponse } from 'interfaces/common';
import { IDocumentBase, DocumentTemplate } from 'interfaces/document/document.interface';

async function uploadDocumentTemplateToPersonal({
  orgId,
  fileName,
  encodedUploadData,
}: {
  orgId: string;
  fileName: string;
  encodedUploadData: string;
}): Promise<DocumentTemplate> {
  return templateGraph.uploadDocumentTemplateToPersonal({
    orgId,
    fileName,
    encodedUploadData,
  });
}

async function uploadDocumentTemplateToOrgTeam({
  teamId,
  fileName,
  encodedUploadData,
}: {
  teamId: string;
  fileName: string;
  encodedUploadData: string;
}): Promise<DocumentTemplate> {
  return templateGraph.uploadDocumentTemplateToOrgTeam({
    teamId,
    fileName,
    encodedUploadData,
  });
}

async function uploadDocumentTemplateToOrganization({
  orgId,
  fileName,
  encodedUploadData,
}: {
  orgId: string;
  fileName: string;
  encodedUploadData: string;
}): Promise<DocumentTemplate> {
  return templateGraph.uploadDocumentTemplateToOrganization({
    orgId,
    fileName,
    encodedUploadData,
  });
}

async function createDocumentFromDocumentTemplate({
  documentId,
  destinationId,
}: {
  documentId: string;
  destinationId: string;
}): Promise<IDocumentBase> {
  return templateGraph.createDocumentFromDocumentTemplate({ documentId, destinationId });
}

function deleteDocumentTemplate({
  documentId,
  clientId,
}: {
  documentId: string;
  clientId: string;
}): Promise<IBasicResponse> {
  return templateGraph.deleteDocumentTemplate({
    documentId,
    clientId,
  });
}

export default {
  uploadDocumentTemplateToPersonal,
  uploadDocumentTemplateToOrgTeam,
  uploadDocumentTemplateToOrganization,
  createDocumentFromDocumentTemplate,
  deleteDocumentTemplate,
};

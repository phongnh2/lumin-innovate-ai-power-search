import { IBasicResponse } from 'interfaces/common';
import { DocumentTemplate, IDocumentBase } from 'interfaces/document/document.interface';

export function uploadDocumentTemplateToPersonal({
  orgId,
  fileName,
  encodedUploadData,
}: {
  orgId: string;
  fileName: string;
  encodedUploadData: string;
}): Promise<DocumentTemplate>;

export function uploadDocumentTemplateToOrgTeam({
  teamId,
  fileName,
  encodedUploadData,
}: {
  teamId: string;
  fileName: string;
  encodedUploadData: string;
}): Promise<DocumentTemplate>;

export function uploadDocumentTemplateToOrganization({
  orgId,
  fileName,
  encodedUploadData,
}: {
  orgId: string;
  fileName: string;
  encodedUploadData: string;
}): Promise<DocumentTemplate>;

export function createDocumentFromDocumentTemplate({
  documentId,
  destinationId,
}: {
  documentId: string;
  destinationId: string;
}): Promise<IDocumentBase>;

export function deleteDocumentTemplate({
  documentId,
  clientId,
}: {
  documentId: string;
  clientId: string;
}): Promise<IBasicResponse>;

import { IDocumentBase } from "interfaces/document/document.interface";

declare namespace templateService {
  export function uploadDocumentTemplateToOrganization(input: {
    orgId: string;
    fileName: string;
    encodedUploadData: string;
  }): Promise<IDocumentBase>;
  export function uploadDocumentTemplateToPersonal(input: {
    orgId: string;
    fileName: string;
    encodedUploadData: string;
  }): Promise<IDocumentBase>;
  export function uploadDocumentTemplateToOrgTeam(input: {
    orgId: string;
    fileName: string;
    encodedUploadData: string;
  }): Promise<IDocumentBase>;
}

export default templateService;
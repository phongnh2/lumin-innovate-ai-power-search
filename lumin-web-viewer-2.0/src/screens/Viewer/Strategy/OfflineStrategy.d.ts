import { IDocumentBase } from "interfaces/document/document.interface";

export default class OfflineStrategy {
  isSystemFile: boolean;

  documentId: string;

  constructor(documentId: string);

  getDocument: () => Promise<IDocumentBase>;

  getSystemDocument: () => Promise<IDocumentBase>;
}
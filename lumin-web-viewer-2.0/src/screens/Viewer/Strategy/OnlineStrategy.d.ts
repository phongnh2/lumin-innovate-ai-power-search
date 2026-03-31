import { IDocumentBase } from "interfaces/document/document.interface";

export default class OnlineStrategy {
  documentId: string;

  constructor(documentId: string);

  getDocument: () => Promise<IDocumentBase>;

  get isTourDocument(): boolean;

}
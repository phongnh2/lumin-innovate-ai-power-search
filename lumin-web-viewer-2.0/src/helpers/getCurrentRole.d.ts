import { IDocumentBase } from 'interfaces/document/document.interface';

declare const getCurrentRole: (currentDocument: IDocumentBase) => IDocumentBase['roleOfDocument'];

export default getCurrentRole;

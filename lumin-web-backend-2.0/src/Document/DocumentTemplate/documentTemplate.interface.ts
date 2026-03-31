import { IDocumentModel } from '../interfaces/document.interface';

export enum DocumentTemplateSourceTypeEnum {
  PDF = 'PDF',
  LUMIN = 'LUMIN',
}

export interface IDocumentTemplateModel extends IDocumentModel {
  templateSourceType: DocumentTemplateSourceTypeEnum;
}

export interface IDocumentTemplate extends IDocumentTemplateModel {
  _id: string;
}

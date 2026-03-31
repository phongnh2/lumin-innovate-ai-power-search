import { DocumentTemplateSourceTypeEnum } from 'Document/DocumentTemplate/documentTemplate.interface';

export type DocumentTemplateProto = {
  template_id: string;
  name: string;
  type: DocumentTemplateSourceTypeEnum;
  created_at: number;
  updated_at: number;
  remote_id?: string;
};

export type DocumentTemplateListResponseProto = {
  total_count: number;
  data: DocumentTemplateProto[];
};

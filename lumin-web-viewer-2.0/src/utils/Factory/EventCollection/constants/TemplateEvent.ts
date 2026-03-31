import { DOCUMENT_TYPE } from 'constants/documentConstants';

export const TemplateCreateMethod = {
  FILE_UPLOAD: 'fileUpload',
  START_BLANK: 'startBlank',
  START_WITH_PROMPT: 'startWithPrompt',
  SAVE_FROM_DOCUMENT: 'saveFromDocument',
};

export const TemplateScope = {
  WORKSPACE: 'workspace',
  SPACE: 'space',
  PERSONAL: 'personal',
};

export const TemplateChannel = {
  TEMPLATE_LIST: 'templateList',
  DOCUMENT_EDITOR: 'documentEditor',
  TEMPLATE_EDITOR: 'templateEditor',
  PUBLIC_API: 'publicApi',
  TEMPLATE_LIBRARY: 'templateLibrary',
};

export const TemplatePlatform = {
  AG: 'ag',
  PDF: 'pdf',
  SIGN: 'sign',
};

export const DocumentTypeTemplateScopeMapping = {
  [DOCUMENT_TYPE.ORGANIZATION]: TemplateScope.WORKSPACE,
  [DOCUMENT_TYPE.ORGANIZATION_TEAM]: TemplateScope.SPACE,
  [DOCUMENT_TYPE.PERSONAL]: TemplateScope.PERSONAL,
};

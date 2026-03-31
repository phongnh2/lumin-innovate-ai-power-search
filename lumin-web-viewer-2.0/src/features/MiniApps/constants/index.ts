import { LayoutElements } from '@new-ui/constants';

import { RIGHT_PANEL_VALUES } from 'features/WebRightPanel/constants';

export const APP_URL_PATH = 'apps';

export const APP_NAMES = {
  RECRUITMENT: 'recruitment',
  XERO_INTEGRATION: 'xero-integration',
};

export const APP_MARKETPLACE_SOURCES = {
  DOCUMENT_LIST: 'documentList',
  DOCUMENT_VIEWER: 'documentViewer',
};

export const MINIAPPS_LAYOUT_MAPPER = {
  'translate-pdf': {
    [APP_MARKETPLACE_SOURCES.DOCUMENT_VIEWER]: LayoutElements.TRANSLATOR,
    [APP_MARKETPLACE_SOURCES.DOCUMENT_LIST]: RIGHT_PANEL_VALUES.TRANSLATOR,
  },
  'invoice-extraction': {
    [APP_MARKETPLACE_SOURCES.DOCUMENT_VIEWER]: LayoutElements.INVOICE_EXTRACTOR,
    [APP_MARKETPLACE_SOURCES.DOCUMENT_LIST]: RIGHT_PANEL_VALUES.INVOICE_EXTRACTOR,
  },
  'resume-checker': {
    [APP_MARKETPLACE_SOURCES.DOCUMENT_VIEWER]: LayoutElements.RESUME_CHECKER,
    [APP_MARKETPLACE_SOURCES.DOCUMENT_LIST]: RIGHT_PANEL_VALUES.RESUME_CHECKER,
  },
};

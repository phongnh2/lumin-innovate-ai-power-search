import { v4 } from 'uuid';

import { IFilePickerOptions } from 'services/oneDriveServices';

import { oneDriveType } from 'constants/documentType';
import { BASEURL } from 'constants/urls';

export default {
  sdk: '8.0',
  authentication: {},
  entry: {
    oneDrive: {
      files: {},
    },
  },
  search: {
    enabled: true,
  },
  messaging: {
    origin: BASEURL,
    channelId: v4(),
  },
  selection: {
    mode: 'multiple',
  },
  typesAndSources: {
    mode: 'files',
    filters: Object.values(oneDriveType),
    pivots: {
      oneDrive: true,
      recent: true,
      shared: true,
    },
  },
  commands: {
    upload: {
      enabled: true,
    },
    createFolder: {
      enabled: false,
    },
  },
} as IFilePickerOptions;

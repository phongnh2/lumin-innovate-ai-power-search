import { v4 } from 'uuid';

import { IFilePickerOptions } from 'services/oneDriveServices';

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
    mode: 'single',
  },
  typesAndSources: {
    mode: 'folders',
    filters: ['folder'],
    pivots: {
      oneDrive: true,
      recent: true,
      shared: true,
    },
  },
  commands: {
    upload: {
      enabled: false,
    },
    createFolder: {
      enabled: true,
    },
  },
} as IFilePickerOptions;

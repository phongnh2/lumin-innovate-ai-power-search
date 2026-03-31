import { ownerFilter, modifiedFilter, folderType } from 'constants/documentConstants';

export default {
  [folderType.DEVICE]: {
    loading: true,
    commonDocuments: {},
    particularDocuments: {
      [modifiedFilter.modifiedByAnyone]: {
        [ownerFilter.byAnyone]: {
          documents: [],
          hasNextPage: false,
          cursor: '',
          firstFetching: true,
          shouldRefetch: false,
          insertRule: () => {},
        },
      },
    },
    foundDocumentScrolling: false,
  },
  [folderType.INDIVIDUAL]: {
    loading: true,
    commonDocuments: {},
    particularDocuments: {
      [modifiedFilter.modifiedByAnyone]: {
        [ownerFilter.byAnyone]: {
          documents: [],
          hasNextPage: false,
          cursor: '',
          firstFetching: true,
          shouldRefetch: false,
          insertRule: () => {},
        },
      },
    },
    foundDocumentScrolling: false,
  },
  [folderType.TEAMS]: {
    loading: true,
    commonDocuments: {},
    particularDocuments: {},
    foundDocumentScrolling: false,
  },
  [folderType.ORGANIZATION]: {
    loading: true,
    commonDocuments: {},
    particularDocuments: {},
    foundDocumentScrolling: false,
  },
  [folderType.STARRED]: {
    loading: true,
    commonDocuments: {},
    particularDocuments: {
      [modifiedFilter.modifiedByAnyone]: {
        [ownerFilter.byAnyone]: {
          documents: [],
          hasNextPage: false,
          cursor: '',
          firstFetching: true,
          shouldRefetch: false,
          insertRule: () => {},
        },
      },
    },
    foundDocumentScrolling: false,
  },
  [folderType.SHARED]: {
    loading: true,
    commonDocuments: {},
    particularDocuments: {
      [modifiedFilter.modifiedByAnyone]: {
        [ownerFilter.byAnyone]: {
          documents: [],
          hasNextPage: false,
          cursor: '',
          firstFetching: true,
          shouldRefetch: false,
          insertRule: () => {},
        },
      },
    },
    foundDocumentScrolling: false,
  },
};

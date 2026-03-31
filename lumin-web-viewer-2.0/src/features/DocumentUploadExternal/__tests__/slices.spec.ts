import reducer, {
  documentUploadExternalSlice,
  documentUploadExternalActions,
  documentUploadExternalSelectors,
  SYNC_STATUS,
} from '../slices';

describe('documentUploadExternal slice', () => {
  describe('initial state', () => {
    it('has default sync status', () => {
      const state = reducer(undefined, { type: 'unknown' });
      expect(state.syncStatus).toBe(SYNC_STATUS.DEFAULT);
    });
  });

  describe('reducers', () => {
    it('setIsSyncing sets status to SYNCING', () => {
      const state = reducer(undefined, documentUploadExternalActions.setIsSyncing());
      expect(state.syncStatus).toBe(SYNC_STATUS.SYNCING);
    });

    it('setIsSaved sets status to SAVED', () => {
      const state = reducer(undefined, documentUploadExternalActions.setIsSaved());
      expect(state.syncStatus).toBe(SYNC_STATUS.SAVED);
    });

    it('resetSyncStatus sets status to DEFAULT', () => {
      let state = reducer(undefined, documentUploadExternalActions.setIsSyncing());
      state = reducer(state, documentUploadExternalActions.resetSyncStatus());
      expect(state.syncStatus).toBe(SYNC_STATUS.DEFAULT);
    });
  });

  describe('selectors', () => {
    it('syncStatus returns sync status', () => {
      const state = { documentUploadExternal: { syncStatus: SYNC_STATUS.SYNCING } };
      expect(documentUploadExternalSelectors.syncStatus(state)).toBe(SYNC_STATUS.SYNCING);
    });

    it('isSyncing returns true when syncing', () => {
      const state = { documentUploadExternal: { syncStatus: SYNC_STATUS.SYNCING } };
      expect(documentUploadExternalSelectors.isSyncing(state)).toBe(true);
    });

    it('isSyncing returns false when not syncing', () => {
      const state = { documentUploadExternal: { syncStatus: SYNC_STATUS.DEFAULT } };
      expect(documentUploadExternalSelectors.isSyncing(state)).toBe(false);
    });

    it('isSyncing returns false when saved', () => {
      const state = { documentUploadExternal: { syncStatus: SYNC_STATUS.SAVED } };
      expect(documentUploadExternalSelectors.isSyncing(state)).toBe(false);
    });
  });

  describe('slice', () => {
    it('has correct name', () => {
      expect(documentUploadExternalSlice.name).toBe('DOCUMENT_UPLOAD_EXTERNAL');
    });
  });

  describe('SYNC_STATUS enum', () => {
    it('has correct values', () => {
      expect(SYNC_STATUS.SYNCING).toBe('syncing');
      expect(SYNC_STATUS.SAVED).toBe('saved');
      expect(SYNC_STATUS.DEFAULT).toBe('default');
    });
  });
});


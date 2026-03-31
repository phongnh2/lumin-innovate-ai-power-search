import topbarUtils from '../topbarUtils';

describe('topbarUtils', () => {
  const documentId = '123123';
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(() => {}),
      setItem: jest.fn(() => {}),
      removeItem: jest.fn(() => {}),
    },
    writable: true
  });
  describe('saveStateDocumentTopbar', () => {
    it('localStorage.removeItem should be called', () => {
      const isShowTopbar = true;
      const spyRemoveItem = jest.spyOn(localStorage, 'removeItem').mockImplementation(() => {});
      topbarUtils.saveStateDocumentTopbar(documentId, isShowTopbar);
      expect(spyRemoveItem).toBeCalled();
      expect(spyRemoveItem).toBeCalledWith('hide-topbar-123123');
      spyRemoveItem.mockRestore();
    });

    it('localStorage.removeItem should be called', () => {
      const isShowTopbar = false;
      const spySetItem = jest.spyOn(localStorage, 'setItem').mockImplementation(() => {});
      topbarUtils.saveStateDocumentTopbar(documentId, isShowTopbar);
      expect(spySetItem).toBeCalled();
      expect(spySetItem).toBeCalledWith('hide-topbar-123123', 'hidden');
      spySetItem.mockRestore();
    });
  });

  describe('isDocumentTopbarShow', () => {
    it('localStorage.getItem should be called', () => {
      const spyGetItem = jest.spyOn(localStorage, 'getItem').mockImplementation(() => {});
      topbarUtils.isDocumentTopbarShow(documentId);
      expect(spyGetItem).toBeCalled();
      expect(spyGetItem).toBeCalledWith('hide-topbar-123123');
      spyGetItem.mockRestore();
    });
  });
});

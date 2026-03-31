import { exitEditPdfMode, showAnnotsToDocument, onConfirmSaveEditedText, onCancelSaveEditText } from '../editPDF';
import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { store } from 'store';
import fireEvent from 'helpers/fireEvent';
import { pageContentUpdatedListener } from 'helpers/pageContentUpdatedListener';
import { isResolvedComment, isResolvedHighlightComment } from 'features/Comments/utils/commons';
import formFieldBackup from 'features/EditorChatBot/utils/formfieldBackup';
import { guestModeManipulateCache } from 'features/GuestModeManipulateCache/base';
import { getLinearizedDocumentFile } from '../getFileService';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { DataElements } from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { syncThirdPartyHandler } from 'features/Annotation/utils/syncThirdPartyService';
import { saveLocalFile } from 'luminComponents/ViewerCommon/LocalSave/helper/saveLocalFile';
import documentServices from 'services/documentServices';
import logger from 'helpers/logger';

jest.mock('actions');
jest.mock('core');
jest.mock('selectors');
jest.mock('store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(),
  },
}));
jest.mock('lumin-components/ViewerCommon/LocalSave/helper/saveLocalFile');
jest.mock('services/documentServices');
jest.mock('helpers/fireEvent');
jest.mock('helpers/logger');
jest.mock('helpers/pageContentUpdatedListener', () => ({
  pageContentUpdatedListener: {
    isProcessingUpdateContent: jest.fn(),
    waitForUpdateContent: jest.fn(),
  },
}));
jest.mock('features/Annotation/utils/syncThirdPartyService', () => ({
  syncThirdPartyHandler: {
    syncThirdParty: jest.fn(),
  },
}));
jest.mock('features/Comments/utils/commons', () => ({
  isResolvedComment: jest.fn(),
  isResolvedHighlightComment: jest.fn(),
}));
jest.mock('features/EditorChatBot/utils/formfieldBackup', () => ({
  clear: jest.fn(),
  restore: jest.fn(),
}));
jest.mock('features/GuestModeManipulateCache/base', () => ({
  guestModeManipulateCache: {
    add: jest.fn(),
  },
}));
jest.mock('../getFileService', () => ({
  getLinearizedDocumentFile: jest.fn(),
}));
jest.mock('../isLandingPageRequest', () => ({
  isLandingPageRequest: jest.fn(),
}));

describe('editPDF', () => {
  let mockDispatch: jest.Mock;
  let mockGetState: jest.Mock;
  let mockAnnotationManager: { getAnnotationsList: jest.Mock; trigger: jest.Mock };
  let mockContentEditManager: { endContentEditMode: jest.Mock; isInContentEditMode: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    mockDispatch = jest.fn();
    mockGetState = jest.fn();
    store.dispatch = mockDispatch;
    store.getState = mockGetState;

    mockAnnotationManager = {
      getAnnotationsList: jest.fn((): any[] => []),
      trigger: jest.fn(),
    };

    mockContentEditManager = {
      endContentEditMode: jest.fn(),
      isInContentEditMode: jest.fn(() => false),
    };

    (core.getAnnotationManager as jest.Mock) = jest.fn(() => mockAnnotationManager);
    (core.getContentEditManager as jest.Mock) = jest.fn(() => mockContentEditManager);
    (core.setToolMode as jest.Mock) = jest.fn();
    (core.refreshAll as jest.Mock) = jest.fn();
    (core.updateView as jest.Mock) = jest.fn();

    (actions.setIsInContentEditMode as jest.Mock) = jest.fn(() => ({ type: 'SET_IS_IN_CONTENT_EDIT_MODE' }));
    (actions.setIsShowToolbarTablet as jest.Mock) = jest.fn(() => ({ type: 'SET_IS_SHOW_TOOLBAR_TABLET' }));
    (actions.openElement as jest.Mock) = jest.fn(() => ({ type: 'OPEN_ELEMENT' }));
    (actions.closeElement as jest.Mock) = jest.fn(() => ({ type: 'CLOSE_ELEMENT' }));
    (actions.updateCurrentDocument as jest.Mock) = jest.fn(() => ({ type: 'UPDATE_CURRENT_DOCUMENT' }));
    (actions.setDiscardContentEdit as jest.Mock) = jest.fn(() => ({ type: 'SET_DISCARD_CONTENT_EDIT' }));
    (actions.setForceReload as jest.Mock) = jest.fn(() => ({ type: 'SET_FORCE_RELOAD' }));

    (pageContentUpdatedListener.isProcessingUpdateContent as jest.Mock) = jest.fn(() => false);
    (pageContentUpdatedListener.waitForUpdateContent as jest.Mock) = jest.fn(() => Promise.resolve());

    // Setup window.Core.Annotations
    if (!window.Core) {
      (window as any).Core = {};
    }
    if (!window.Core.Annotations) {
      (window as any).Core.Annotations = {};
    }
    (window as any).Core.Annotations.TextMarkupAnnotation = class TextMarkupAnnotation { };
    (window as any).Core.Annotations.Color = jest.fn((r, g, b) => ({ R: r, G: g, B: b }));
  });

  describe('exitEditPdfMode', () => {
    it('should exit edit PDF mode correctly', () => {
      exitEditPdfMode();

      expect(mockDispatch).toHaveBeenCalledWith(actions.setIsInContentEditMode(false));
      expect(mockDispatch).toHaveBeenCalledWith(actions.setIsShowToolbarTablet(true));
      expect(core.setToolMode).toHaveBeenCalledWith(defaultTool);
      expect(core.refreshAll).toHaveBeenCalled();
      expect(core.updateView).toHaveBeenCalled();
      expect(formFieldBackup.clear).toHaveBeenCalled();
    });
  });

  describe('showAnnotsToDocument', () => {
    it('should show annotations to document', () => {
      const mockAnnotation = {
        ReadOnly: true,
        Hidden: true,
        getCustomData: jest.fn(),
        deleteCustomData: jest.fn(),
      };
      mockAnnotationManager.getAnnotationsList.mockReturnValue([mockAnnotation]);
      (isResolvedComment as jest.Mock).mockReturnValue(false);
      (isResolvedHighlightComment as jest.Mock).mockReturnValue(false);

      showAnnotsToDocument();

      expect(mockAnnotation.ReadOnly).toBe(false);
      expect(mockAnnotation.Hidden).toBe(false);
      expect(mockAnnotationManager.trigger).toHaveBeenCalled();
    });

    it('should handle TextMarkupAnnotation with custom data', () => {
      const mockAnnotation: any = {
        ReadOnly: true,
        Hidden: true,
        getCustomData: jest.fn(() =>
          JSON.stringify({
            strokeColor: { R: 255, G: 0, B: 0 },
            opacity: 0.5,
          })
        ),
        deleteCustomData: jest.fn(),
        StrokeColor: null,
        Opacity: null,
        PageNumber: 1,
      };
      Object.setPrototypeOf(mockAnnotation, window.Core.Annotations.TextMarkupAnnotation.prototype);
      mockAnnotationManager.getAnnotationsList.mockReturnValue([mockAnnotation]);
      (isResolvedComment as jest.Mock).mockReturnValue(false);
      (isResolvedHighlightComment as jest.Mock).mockReturnValue(false);

      showAnnotsToDocument();

      expect(mockAnnotation.ReadOnly).toBe(false);
      expect(mockAnnotation.Hidden).toBe(false);
      expect(window.Core.Annotations.Color).toHaveBeenCalled();
    });

    it('should skip annotations that are resolved', () => {
      const mockAnnotation = {
        ReadOnly: true,
        Hidden: true,
      };
      mockAnnotationManager.getAnnotationsList.mockReturnValue([mockAnnotation]);
      (isResolvedComment as jest.Mock).mockReturnValue(true);
      (isResolvedHighlightComment as jest.Mock).mockReturnValue(false);
  
      showAnnotsToDocument();
  
      expect(mockAnnotation.ReadOnly).toBe(true);
      expect(mockAnnotation.Hidden).toBe(true);
      expect(mockAnnotationManager.trigger).not.toHaveBeenCalled();
    });
  
    it('should not trigger annotationChanged if no annotation modified', () => {
      const mockAnnotation = {
        ReadOnly: false,
        Hidden: false,
      };
      mockAnnotationManager.getAnnotationsList.mockReturnValue([mockAnnotation]);
      (isResolvedComment as jest.Mock).mockReturnValue(true);
      (isResolvedHighlightComment as jest.Mock).mockReturnValue(true);
  
      showAnnotsToDocument();
  
      expect(mockAnnotationManager.trigger).not.toHaveBeenCalled();
    });
  });

  describe('onConfirmSaveEditedText', () => {
    const mockCurrentDocument: any = {
      _id: 'doc-1',
      service: STORAGE_TYPE.S3,
      name: 'test.pdf',
    };

    beforeEach(() => {
      mockGetState.mockReturnValue({});
      (selectors.getCurrentDocument as jest.Mock) = jest.fn(() => mockCurrentDocument);
    });

    it('should handle Google storage without exit', async () => {
      mockCurrentDocument.service = STORAGE_TYPE.GOOGLE;
      (pageContentUpdatedListener.isProcessingUpdateContent as jest.Mock) = jest.fn(() => false);

      await onConfirmSaveEditedText({ isExitFromViewerWithoutChange: false });

      expect(mockContentEditManager.endContentEditMode).toHaveBeenCalled();
      expect(fireEvent).toHaveBeenCalledWith('content_edit_updated');
    });

    it('should wait for update content for Google storage', async () => {
      mockCurrentDocument.service = STORAGE_TYPE.GOOGLE;
      (pageContentUpdatedListener.isProcessingUpdateContent as jest.Mock) = jest.fn(() => true);
      (pageContentUpdatedListener.waitForUpdateContent as jest.Mock) = jest.fn(() => Promise.resolve());

      await onConfirmSaveEditedText({ isExitFromViewerWithoutChange: false });

      expect(pageContentUpdatedListener.waitForUpdateContent).toHaveBeenCalled();
      expect(mockContentEditManager.endContentEditMode).toHaveBeenCalled();
    });

    it('should handle guest mode manipulation', async () => {
      mockCurrentDocument.service = STORAGE_TYPE.S3;
      const mockFile = new Blob(['test'], { type: 'application/pdf' });
      (getLinearizedDocumentFile as jest.Mock).mockResolvedValue(mockFile);
      const mockHandleStore = jest.fn();

      await onConfirmSaveEditedText({
        isManipulateInGuestMode: true,
        handleStoreExploreFeatureGuestMode: mockHandleStore,
      });

      expect(getLinearizedDocumentFile).toHaveBeenCalledWith(mockCurrentDocument.name, null);
      expect(guestModeManipulateCache.add).toHaveBeenCalled();
      expect(mockHandleStore).toHaveBeenCalled();
    });

    it('should empty props', async () => {
      await onConfirmSaveEditedText();
      expect(mockContentEditManager.endContentEditMode).toHaveBeenCalled();
    });
  });

  describe('onCancelSaveEditText', () => {
    const mockCurrentDocument: any = {
      _id: 'doc-1',
      service: STORAGE_TYPE.SYSTEM,
      name: 'test.pdf',
    };

    beforeEach(() => {
      mockGetState.mockReturnValue({});
      (selectors.getCurrentDocument as jest.Mock) = jest.fn(() => mockCurrentDocument);
      jest.clearAllMocks();
    });

    it('should cancel save edit text', async () => {
      (pageContentUpdatedListener.isProcessingUpdateContent as jest.Mock) = jest.fn(() => false);

      await onCancelSaveEditText();

      expect(mockContentEditManager.endContentEditMode).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(actions.setDiscardContentEdit(true));
      expect(mockDispatch).toHaveBeenCalledWith(actions.setForceReload(true));
      expect(mockDispatch).toHaveBeenCalledWith(actions.setIsInContentEditMode(false));
      expect(mockDispatch).toHaveBeenCalledWith(actions.setIsShowToolbarTablet(true));
      expect(core.setToolMode).toHaveBeenCalledWith(defaultTool);
    });

    it('should handle processing update content', async () => {
      (pageContentUpdatedListener.isProcessingUpdateContent as jest.Mock) = jest.fn(() => true);
      (pageContentUpdatedListener.waitForUpdateContent as jest.Mock) = jest.fn(() => Promise.resolve());

      await onCancelSaveEditText();

      expect(mockDispatch).toHaveBeenCalledWith(actions.openElement(DataElements.LOADING_MODAL));
      expect(formFieldBackup.restore).toHaveBeenCalled();
      expect(pageContentUpdatedListener.waitForUpdateContent).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(actions.closeElement(DataElements.LOADING_MODAL));
    });

    it('should update unsaved system file', async () => {
      mockCurrentDocument.isSystemFile = true;
      mockCurrentDocument.unsaved = true;
      (pageContentUpdatedListener.isProcessingUpdateContent as jest.Mock) = jest.fn(() => false);

      await onCancelSaveEditText();

      expect(mockDispatch).toHaveBeenCalledWith(
        actions.updateCurrentDocument({ unsaved: false })
      );
    });

    it('should not force reload when option is set', async () => {
      (pageContentUpdatedListener.isProcessingUpdateContent as jest.Mock) = jest.fn(() => false);

      await onCancelSaveEditText({ forceReload: false });

      expect(mockDispatch).not.toHaveBeenCalledWith(actions.setForceReload(true));
    });
  });
});


import { store } from 'store';

import documentServices from 'services/documentServices';

import { setIsUsingPageToolsWithAI } from 'features/EditorChatBot/slices';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { rotatePage } from 'features/EditorChatBot/ai/tools/rotatePage';

jest.mock('store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn().mockReturnValue({}),
  },
}));

jest.mock('services/documentServices', () => ({
  rotatePages: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('features/EditorChatBot/slices', () => ({
  setIsUsingPageToolsWithAI: jest.fn(),
}));

jest.mock('selectors', () => ({
  isPageEditMode: jest.fn().mockReturnValue(false),
  getThumbs: jest.fn().mockReturnValue([]),
}));

jest.mock('actions', () => ({
  updateThumbs: jest.fn(),
}));

jest.mock('utils/manipulation', () => ({
  onLoadThumbs: jest.fn().mockResolvedValue({}),
}));

window.Core.PageRotation = {
  E_0: 0,
  E_90: 1,
  E_180: 2,
  E_270: 3,
};

describe('rotatePage', () => {
  const mockCurrentDocument = { _id: 'doc123' } as IDocumentBase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should rotate a single page correctly', async () => {
    const pages = [1];
    const angles = [90];

    const result = await rotatePage({
      pages,
      angles,
      currentDocument: mockCurrentDocument,
    });

    expect(store.dispatch).toHaveBeenCalledTimes(2);
    expect(store.dispatch).toHaveBeenNthCalledWith(1, setIsUsingPageToolsWithAI(true));
    expect(store.dispatch).toHaveBeenNthCalledWith(2, setIsUsingPageToolsWithAI(false));

    expect(documentServices.rotatePages).toHaveBeenCalledTimes(1);
    expect(documentServices.rotatePages).toHaveBeenCalledWith({
      currentDocument: mockCurrentDocument,
      pageIndexes: [1],
      angle: window.Core.PageRotation.E_90,
    });

    expect(result).toBe('Successfully rotated pages');
  });

  it('should handle multiple pages with the same rotation angle', async () => {
    const pages = [1, 2, 3];
    const angles = [90, 90, 90];

    await rotatePage({
      pages,
      angles,
      currentDocument: mockCurrentDocument,
    });

    expect(documentServices.rotatePages).toHaveBeenCalledTimes(1);
    expect(documentServices.rotatePages).toHaveBeenCalledWith({
      currentDocument: mockCurrentDocument,
      pageIndexes: [1, 2, 3],
      angle: window.Core.PageRotation.E_90,
    });
  });

  it('should handle multiple pages with different rotation angles', async () => {
    const pages = [1, 2, 3];
    const angles = [90, 180, 270];

    await rotatePage({
      pages,
      angles,
      currentDocument: mockCurrentDocument,
    });

    expect(documentServices.rotatePages).toHaveBeenCalledTimes(3);
    expect(documentServices.rotatePages).toHaveBeenNthCalledWith(1, {
      currentDocument: mockCurrentDocument,
      pageIndexes: [1],
      angle: window.Core.PageRotation.E_90,
    });
    expect(documentServices.rotatePages).toHaveBeenNthCalledWith(2, {
      currentDocument: mockCurrentDocument,
      pageIndexes: [2],
      angle: window.Core.PageRotation.E_180,
    });
    expect(documentServices.rotatePages).toHaveBeenNthCalledWith(3, {
      currentDocument: mockCurrentDocument,
      pageIndexes: [3],
      angle: window.Core.PageRotation.E_270,
    });

  });

  it('should handle mixed pages with some sharing the same angle', async () => {
    const pages = [1, 2, 3, 4, 5];
    const angles = [90, 180, 90, 270, 180];

    await rotatePage({
      pages,
      angles,
      currentDocument: mockCurrentDocument,
    });

    expect(documentServices.rotatePages).toHaveBeenCalledTimes(3);

    expect(documentServices.rotatePages).toHaveBeenCalledWith(
      expect.objectContaining({
        pageIndexes: [1, 3],
        angle: window.Core.PageRotation.E_90,
      })
    );

    expect(documentServices.rotatePages).toHaveBeenCalledWith(
      expect.objectContaining({
        pageIndexes: [2, 5],
        angle: window.Core.PageRotation.E_180,
      })
    );

    expect(documentServices.rotatePages).toHaveBeenCalledWith(
      expect.objectContaining({
        pageIndexes: [4],
        angle: window.Core.PageRotation.E_270,
      })
    );
  });

  it('should handle a 0/360 degree rotation correctly', async () => {
    const pages = [1, 2];
    const angles = [0, 360];

    await rotatePage({
      pages,
      angles,
      currentDocument: mockCurrentDocument,
    });

    expect(documentServices.rotatePages).toHaveBeenCalledWith(
      expect.objectContaining({
        currentDocument: mockCurrentDocument,
        pageIndexes: [1],
        angle: window.Core.PageRotation.E_0,
      })
    );

    expect(documentServices.rotatePages).toHaveBeenCalledWith(
      expect.objectContaining({
        currentDocument: mockCurrentDocument,
        pageIndexes: [2],
        angle: window.Core.PageRotation.E_0,
      })
    );
  });

  it('should handle errors and clean up state', async () => {
    const pages = [1];
    const angles = [90];

    (documentServices.rotatePages as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

    const result = await rotatePage({
      pages,
      angles,
      currentDocument: mockCurrentDocument,
    });

    expect(store.dispatch).toHaveBeenCalledTimes(2);
    expect(store.dispatch).toHaveBeenNthCalledWith(1, setIsUsingPageToolsWithAI(true));
    expect(store.dispatch).toHaveBeenNthCalledWith(2, setIsUsingPageToolsWithAI(false));

    expect(result).toBe('Failed to rotate pages. Please try again.');
  });

  it('should convert angles to proper Core.PageRotation values', async () => {
    const pages = [1];
    const angles = [90];

    await rotatePage({
      pages,
      angles,
      currentDocument: mockCurrentDocument,
    });

    expect(documentServices.rotatePages).toHaveBeenCalledWith(
      expect.objectContaining({
        angle: window.Core.PageRotation.E_90,
      })
    );
  });
});

import 'jest-canvas-mock';
import core from 'core';
import selectors from 'selectors';
import { MANIPULATION_TYPE } from 'constants/lumin-common';
import manipulation from '../manipulation';
import { store } from '../../redux/store';
import fileUtil from 'utils/file';
import documentServices from 'services/documentServices';

jest.mock('core');

describe('manipulation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDocumentCanvasByIndex', () => {
    it('loadCanvas should return canvas', async () => {
      const mockedLoadCanvasAsync = jest
        .fn()
        .mockImplementation(({ drawComplete }) => {
          const canvas = document.createElement('CANVAS');
          drawComplete(canvas);
        });
      const mockedGetDocument = jest.fn(() => ({
        getPageInfo: jest.fn((page) => ({
          width: 123,
          height: 100,
        })),
        loadCanvas: mockedLoadCanvasAsync,
      }));
      core.getDocument = mockedGetDocument;

      const canvas = await manipulation.getDocumentCanvasByIndex(0, {});
      expect(mockedLoadCanvasAsync).toHaveBeenCalled();
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    });

    it('loadCanvas should return null', async () => {
      const mockedLoadCanvasAsync = jest
        .fn()
        .mockImplementation(({ drawComplete }) => {
          drawComplete(null);
        });
      const mockedGetDocument = jest.fn(() => ({
        getPageInfo: jest.fn((page) => ({
          width: 123,
          height: 100,
        })),
        loadCanvas: mockedLoadCanvasAsync,
      }));
      core.getDocument = mockedGetDocument;
      await expect(manipulation.getDocumentCanvasByIndex(0, {}))
        .rejects
        .toThrow('Cannot get the canvas');
    });

    it('should handle rotation < 0', async () => {
      core.getCompleteRotation = jest.fn(() => 1);
      core.getRotation = jest.fn(() => 2);
  
      const mockedLoadCanvasAsync = jest.fn(({ drawComplete }) => {
        const canvas = document.createElement('CANVAS');
        drawComplete(canvas);
      });
  
      core.getDocument = jest.fn(() => ({
        getPageInfo: () => ({ width: 123, height: 100 }),
        loadCanvas: mockedLoadCanvasAsync,
      }));
  
      core.setAnnotationCanvasTransform = jest.fn();
      core.drawAnnotations = jest.fn();
  
      const canvas = await manipulation.getDocumentCanvasByIndex(0, {});
  
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(core.setAnnotationCanvasTransform).toHaveBeenCalled();
    });
  
    it('should handle canvas being an Image', async () => {
      core.getCompleteRotation = jest.fn(() => 0);
      core.getRotation = jest.fn(() => 0);
  
      const image = new Image();
      image.src = 'mocked-src';
  
      const mockedLoadCanvasAsync = jest.fn(({ drawComplete }) => {
        drawComplete(image);
      });
  
      core.getDocument = jest.fn(() => ({
        getPageInfo: () => ({ width: 123, height: 100 }),
        loadCanvas: mockedLoadCanvasAsync,
      }));
  
      const newCanvasMock = document.createElement('canvas');
      fileUtil.getCanvasFromUrl = jest.fn().mockResolvedValue(newCanvasMock);
  
      core.setAnnotationCanvasTransform = jest.fn();
      core.drawAnnotations = jest.fn();
  
      const canvas = await manipulation.getDocumentCanvasByIndex(0, {});
  
      expect(fileUtil.getCanvasFromUrl).toHaveBeenCalledWith('http://localhost/mocked-src');
      expect(canvas).toBe(newCanvasMock);
    });
  });

  describe('onLoadThumbs', () => {
    it('should trigger getDocumentCanvasByIndex, setDimensionThumbnail and convertCanvasToImageObject', async () => {
      const spyGetDocumentCanvasByIndex = jest
        .spyOn(manipulation, 'getDocumentCanvasByIndex')
        .mockImplementation(() => ({
          className: '',
          style: {
            width: '100px',
            height: '100px',
          },
        }));
      const spySetDimensionThumbnail = jest
        .spyOn(manipulation, 'setDimensionThumbnail')
        .mockImplementation(() => ({
          width: 100,
          height: 100,
        }));
      const spyConvertCanvasToImageObject = jest
        .spyOn(manipulation, 'convertCanvasToImageObject')
        .mockImplementation(() => new Image());

      const output = await manipulation.onLoadThumbs(0);
      expect(spyGetDocumentCanvasByIndex).toBeCalled();
      expect(spyConvertCanvasToImageObject).toBeCalled();

      // restore all mocks
      spySetDimensionThumbnail.mockRestore();
      spyGetDocumentCanvasByIndex.mockRestore();
      spyConvertCanvasToImageObject.mockRestore();
    });
  });

  describe('setDimensionThumbnail', () => {
    it('containerRatio greater than ratio', () => {
      const { width, height } = manipulation.setDimensionThumbnail(2, 1);
      expect(width).toBe(450);
      expect(height).toBe(450);
    });
  });

  describe('rotateCssPage', () => {
    const spySetDimensionThumbnail = jest
      .spyOn(manipulation, 'setDimensionThumbnail')
      .mockImplementation(() => ({
        width: 100,
        height: 100,
      }));
    it('should be return void when pageIndex greater than thumbs length', () => {
      const mockedGetThumbs = jest.fn().mockImplementation(() => []);
      selectors.getThumbs = mockedGetThumbs;
      manipulation.rotateCssPage({ pageIndex: 3 });
      expect(spySetDimensionThumbnail).toHaveBeenCalledTimes(0);
    });

    it('should trigger calcDimensionCanvasFromZeroAngle', () => {
      const mockedGetThumbs = jest.fn().mockImplementation(() => [
        {
          className: '',
          width: 100,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ]);
      const mockedCalcDimensionCanvasFromZeroAngle = jest
        .spyOn(manipulation, 'calcDimensionCanvasFromZeroAngle')
        .mockImplementation(() => {});
      selectors.getThumbs = mockedGetThumbs;
      manipulation.rotateCssPage({ pageIndex: 0, angle: 1 });
      expect(mockedCalcDimensionCanvasFromZeroAngle).toHaveBeenCalled();
      mockedCalcDimensionCanvasFromZeroAngle.mockRestore();
    });

    it('should trigger calcDimensionCanvasFromRightRotate', () => {
      const mockedGetThumbs = jest.fn().mockImplementation(() => [
        {
          className: 'thumb-rotate-right',
          width: 100,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ]);
      const mockedCalcDimensionCanvasFromRightRotate = jest
        .spyOn(manipulation, 'calcDimensionCanvasFromRightRotate')
        .mockImplementation(() => {});
      selectors.getThumbs = mockedGetThumbs;
      manipulation.rotateCssPage({ pageIndex: 0, angle: 1 });
      expect(mockedCalcDimensionCanvasFromRightRotate).toHaveBeenCalled();
      mockedCalcDimensionCanvasFromRightRotate.mockRestore();
    });

    it('should trigger calcDimensionCanvasFromLeftRotate', () => {
      const mockedGetThumbs = jest.fn().mockImplementation(() => [
        {
          className: 'thumb-rotate-left',
          width: 100,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ]);
      const mockedCalcDimensionCanvasFromLeftRotate = jest
        .spyOn(manipulation, 'calcDimensionCanvasFromLeftRotate')
        .mockImplementation(() => {});
      selectors.getThumbs = mockedGetThumbs;
      manipulation.rotateCssPage({ pageIndex: 0, angle: -1 });
      expect(mockedCalcDimensionCanvasFromLeftRotate).toHaveBeenCalled();
      mockedCalcDimensionCanvasFromLeftRotate.mockRestore();
    });

    it('should trigger calcDimensionCanvasFromInvert', () => {
      const mockedGetThumbs = jest.fn().mockImplementation(() => [
        {
          className: 'thumb-rotate-bottom',
          width: 100,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ]);
      const mockedCalcDimensionCanvasFromInvert = jest
        .spyOn(manipulation, 'calcDimensionCanvasFromInvert')
        .mockImplementation(() => {});
      selectors.getThumbs = mockedGetThumbs;
      manipulation.rotateCssPage({ pageIndex: 0, angle: -1 });
      expect(mockedCalcDimensionCanvasFromInvert).toHaveBeenCalled();
      mockedCalcDimensionCanvasFromInvert.mockRestore();
    });
  });

  describe('calcDimensionCanvasFromZeroAngle', () => {
    it('case width less than height and height greater than width of canvas', () => {
      const mockedThumbs = [
        {
          className: '',
          width: 99,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromZeroAngle({
        thumbs: mockedThumbs,
        angle: 1,
        widthOfCanvas: 50,
        ratio: 1,
        width: 99,
        height: 100,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('thumb-rotate-right');
      expect(output[0].width).toEqual(50);
      expect(output[0].height).toEqual(50);
    });

    it('case width greater than height and height less than width of canvas', () => {
      const mockedThumbs = [
        {
          className: '',
          width: 101,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromZeroAngle({
        thumbs: mockedThumbs,
        angle: -1,
        widthOfCanvas: 230,
        ratio: 1,
        width: 101,
        height: 100,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('thumb-rotate-left');
      expect(output[0].width).toEqual(230);
      expect(output[0].height).toEqual(230);
    });

    it('should not resize when height <= widthOfCanvas', () => {
      const mockedThumbs = [
        {
          className: '',
          width: 50,
          height: 50,
        },
      ];
    
      const output = manipulation.calcDimensionCanvasFromZeroAngle({
        thumbs: mockedThumbs,
        angle: 1,
        widthOfCanvas: 100,
        ratio: 1,
        width: 50,
        height: 60,
        pageIndex: 0,
      });
    
      expect(output[0].className).toMatch('thumb-rotate-right');
      expect(output[0].width).toEqual(50);
      expect(output[0].height).toEqual(50);
    });
    
    it('should not resize when height < widthOfCanvas', () => {
      const mockedThumbs = [
        {
          className: '',
          width: 50,
          height: 50,
        },
      ];
    
      const output = manipulation.calcDimensionCanvasFromZeroAngle({
        thumbs: mockedThumbs,
        angle: 1,
        widthOfCanvas: 40,
        ratio: 1,
        width: 60,
        height: 50,
        pageIndex: 0,
      });
    
      expect(output[0].className).toMatch('thumb-rotate-right');
      expect(output[0].width).toEqual(50);
      expect(output[0].height).toEqual(50);
    });
  });

  describe('calcDimensionCanvasFromRightRotate', () => {
    it('case width less than height and width less than width of canvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-right',
          width: 99,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromRightRotate({
        thumbs: mockedThumbs,
        angle: 1,
        widthOfCanvas: 200,
        ratio: 1,
        width: 99,
        height: 100,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('thumb-rotate-bottom');
      expect(output[0].width).toEqual(200);
      expect(output[0].height).toEqual(200);
    });

    it('case width greater than height and width greater than width of canvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-right',
          width: 101,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromRightRotate({
        thumbs: mockedThumbs,
        angle: -1,
        widthOfCanvas: 50,
        ratio: 1,
        width: 101,
        height: 100,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('');
      expect(output[0].width).toEqual(50);
      expect(output[0].height).toEqual(50);
    });

    it('case width > widthOfCanvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-right',
          width: 101,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromRightRotate({
        thumbs: mockedThumbs,
        angle: -1,
        widthOfCanvas: 50,
        ratio: 1,
        width: 100,
        height: 101,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('');
    });

    it('case width > widthOfCanvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-right',
          width: 101,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromRightRotate({
        thumbs: mockedThumbs,
        angle: -1,
        widthOfCanvas: 101,
        ratio: 1,
        width: 100,
        height: 50,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('');
    });
  });

  describe('calcDimensionCanvasFromLeftRotate', () => {
    it('case width less than height and width less than width of canvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-left',
          width: 99,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromLeftRotate({
        thumbs: mockedThumbs,
        angle: 1,
        widthOfCanvas: 200,
        ratio: 1,
        width: 99,
        height: 100,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('');
      expect(output[0].width).toEqual(200);
      expect(output[0].height).toEqual(200);
    });

    it('case width greater than height and width greater than width of canvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-left',
          width: 101,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromLeftRotate({
        thumbs: mockedThumbs,
        angle: -1,
        widthOfCanvas: 50,
        ratio: 1,
        width: 101,
        height: 100,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('thumb-rotate-bottom');
      expect(output[0].width).toEqual(50);
      expect(output[0].height).toEqual(50);
    });

    it('case width > widthOfCanvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-left',
          width: 101,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromLeftRotate({
        thumbs: mockedThumbs,
        angle: -1,
        widthOfCanvas: 50,
        ratio: 1,
        width: 100,
        height: 101,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('');
    });

    it('case width > widthOfCanvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-left',
          width: 101,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromLeftRotate({
        thumbs: mockedThumbs,
        angle: -1,
        widthOfCanvas: 101,
        ratio: 1,
        width: 100,
        height: 50,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('');
    });
  });

  describe('calcDimensionCanvasFromInvert', () => {
    it('case width less than height and height greater than width of canvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-bottom',
          width: 99,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromInvert({
        thumbs: mockedThumbs,
        angle: 1,
        widthOfCanvas: 50,
        ratio: 1,
        width: 99,
        height: 100,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('thumb-rotate-left');
      expect(output[0].width).toEqual(50);
      expect(output[0].height).toEqual(50);
    });

    it('case width greater than height and height less than width of canvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-bottom',
          width: 101,
          height: 100,
        },
        {
          className: '',
          width: 100,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromInvert({
        thumbs: mockedThumbs,
        angle: -1,
        widthOfCanvas: 230,
        ratio: 1,
        width: 101,
        height: 100,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('thumb-rotate-right');
      expect(output[0].width).toEqual(230);
      expect(output[0].height).toEqual(230);
    });

    it('case width > widthOfCanvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-left',
          width: 101,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromInvert({
        thumbs: mockedThumbs,
        angle: -1,
        widthOfCanvas: 101,
        ratio: 1,
        width: 50,
        height: 100,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('');
    });

    it('case width > widthOfCanvas', () => {
      const mockedThumbs = [
        {
          className: 'thumb-rotate-left',
          width: 101,
          height: 100,
        },
      ];
      const output = manipulation.calcDimensionCanvasFromInvert({
        thumbs: mockedThumbs,
        angle: -1,
        widthOfCanvas: 40,
        ratio: 1,
        width: 101,
        height: 50,
        pageIndex: 0,
      });
      expect(output[0].className).toMatch('');
    });
  });

  describe('saveRotateOfThumbOutsideViewport', () => {
    it('should push new item to exist list localStorage', () => {
      window.localStorage.setItem('manipulation-0', '[1]');
      manipulation.saveRotateOfThumbOutsideViewport({ index: 0, angle: 1 });
      expect(window.localStorage.getItem('manipulation-0')).toEqual('[1,1]');
    });

    it('should push new item to localStorage', () => {
      window.localStorage.clear();
      manipulation.saveRotateOfThumbOutsideViewport({ index: 0, angle: 1 });
      expect(window.localStorage.getItem('manipulation-0')).toEqual('[1]');
    });
  });

  describe('removeDataAfterRotate', () => {
    it('should remove item', () => {
      window.localStorage.setItem('manipulation-0', '[1]');
      manipulation.removeDataAfterRotate(0);
      expect(window.localStorage.getItem('manipulation-0')).toBeNull();
    });
  });

  describe('convertCanvasToImageObject', () => {
    const canvasMock = document.createElement('CANVAS');
    const ctx = canvasMock.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 150, 75);
    const imageObject = manipulation.convertCanvasToImageObject(
      canvasMock,
      100,
      100,
    );
    expect(imageObject.src).toBeInstanceOf(HTMLCanvasElement);
    expect(imageObject.width).toEqual(100);
    expect(imageObject.height).toEqual(100);
    expect(imageObject.className).toEqual('');
  });

  describe('undoDeletePageCore', () => {
    core.CoreControls = {
      Document: jest.fn((file, extension) => ({
        loadAsync: jest.fn((partRetriever, callback) => {
          callback();
        }),
      })),
      PartRetrievers: {
        getPartRetriever: jest.fn(),
        TYPES: {
          LocalPdfPartRetriever: 'LocalPdfPartRetriever',
        },
      },
      getDefaultBackendType: jest
        .fn()
        .mockImplementation(() => Promise.resolve('ems')),
      initPDFWorkerTransports: (backendType, {}) => jest.fn(),
      initPDFWorkerTransports: jest.fn(),
    };

    it('insertPageAfterUndoDelete should be triggered', async () => {
      const spyInsertPageAfterUndoDelete = jest
        .spyOn(manipulation, 'insertPageAfterUndoDelete')
        .mockImplementation(() => Promise.resolve());
      await manipulation.undoDeletePageCore();
      expect(spyInsertPageAfterUndoDelete).toHaveBeenCalled();
      spyInsertPageAfterUndoDelete.mockRestore();
    });
  });

  describe('insertPageAfterUndoDelete', () => {
    core.CoreControls = {
      Document: jest.fn((file, extension) => ({
        loadAsync: jest.fn((partRetriever, callback) => {
          callback();
        }),
      })),
      PartRetrievers: {
        getPartRetriever: jest.fn(),
        TYPES: {
          LocalPdfPartRetriever: 'LocalPdfPartRetriever',
        },
      },
      getDefaultBackendType: jest
        .fn()
        .mockImplementation(() => Promise.resolve('ems')),
      initPDFWorkerTransports: (backendType, {}) => jest.fn(),
      initPDFWorkerTransports: jest.fn(),
    };

    it('should be resolved', async () => {

      jest.spyOn(core, 'getDocument').mockImplementation(() => ({
        insertPages: jest.fn().mockImplementation(() => Promise.resolve()),

      }));
      const spyAddAnnotation = jest
        .spyOn(core, 'addAnnotations')
        .mockImplementation(() => {});
      const newDoc = new core.CoreControls.Document();
      await manipulation.insertPageAfterUndoDelete({
        newDoc,
      });
      expect(spyAddAnnotation).toHaveBeenCalled();
      spyAddAnnotation.mockRestore();
    });

    it('should be rejected', async () => {
      core.CoreControls = {
        Document: jest.fn((file, extension) => ({
          loadAsync: jest.fn((partRetriever, callback) => {
            callback();
          }),
        })),
        getDefaultBackendType: jest
          .fn()
          .mockImplementation(() => Promise.resolve('ems')),
        // eslint-disable-next-line no-empty-pattern
        initPDFWorkerTransports: (backendType, func = {}) => jest.fn(),
        PartRetrievers: {
          LocalPdfPartRetriever: jest.fn(),
        },
        // initPDFWorkerTransports: jest.fn()
      };
      const spyAddAnnotation = jest
        .spyOn(core, 'addAnnotations')
        .mockImplementation(() => {});
      const newDoc = new core.CoreControls.Document();
      try {
        await manipulation.insertPageAfterUndoDelete({
          newDoc,
        });
      } catch (err) {
        expect(spyAddAnnotation).toHaveBeenCalledTimes(0);
        expect(err).toBeInstanceOf(Error);
        spyAddAnnotation.mockRestore();
      }
    });
  });

  describe('executeRotate', () => {
    it('dispatch updateThumbs should be called', async () => {
      const spyCoreRotatePages = jest
        .spyOn(core, 'rotatePages')
        .mockImplementation(() => Promise.resolve());
      const spyDispatch = jest
        .spyOn(store, 'dispatch')
        .mockImplementation(() => {});

      await manipulation.executeRotate({
        option: {
          pageIndexes: [0, 1],
          angle: 1,
        },
        needUpdateThumbnail: true,
        thumbs: [{}],
      });

      expect(spyDispatch).toHaveBeenCalled();
      expect(spyCoreRotatePages).toHaveBeenCalled();
      expect(core.updateView).toHaveBeenCalled();
      spyDispatch.mockRestore();
      spyCoreRotatePages.mockRestore();
    });

    it('pageIndexes is not an array', async () => {
      const spyCoreRotatePages = jest
        .spyOn(core, 'rotatePages')
        .mockImplementation(() => Promise.resolve());
      await manipulation.executeRotate({
        option: {
          pageIndexes: '1',
          angle: 1,
        },
        needUpdateThumbnail: true,
        thumbs: [{}],
      });

      expect(spyCoreRotatePages).toHaveBeenCalledTimes(0);
      spyCoreRotatePages.mockRestore();
    });

    it('thumb.lenght = 0', async () => {
      const spyCoreRotatePages = jest
        .spyOn(core, 'rotatePages')
        .mockImplementation(() => Promise.resolve());
      await manipulation.executeRotate({
        option: {
          pageIndexes: [0, 1],
          angle: 1,
        },
        needUpdateThumbnail: true,
        thumbs: [],
      });

      expect(spyCoreRotatePages).toHaveBeenCalledTimes(1);
      spyCoreRotatePages.mockRestore();
    });
  });

  describe('executeMovePage', () => {
    it('dispatch updateThumbs should be called', async () => {
      const spyCoreMovePages = jest
        .spyOn(core, 'movePages')
        .mockImplementation(() => Promise.resolve());
      const spyDispatch = jest
        .spyOn(store, 'dispatch')
        .mockImplementation(() => {});

      const spyOnLoadThumbs = jest
        .spyOn(manipulation, 'onLoadThumbs')
        .mockImplementation(() => ({
          className: '',
          width: 100,
          height: 100,
          src: '',
        }));

      await manipulation.executeMovePage({
        option: {
          insertBeforePage: 3,
          pagesToMove: 1,
        },
        needUpdateThumbnail: true,
        thumbs: [{}],
      });

      expect(spyDispatch).toHaveBeenCalled();
      expect(spyOnLoadThumbs).toHaveBeenCalled();
      expect(spyCoreMovePages).toHaveBeenCalled();
      expect(core.updateView).toHaveBeenCalled();
      spyDispatch.mockRestore();
      spyCoreMovePages.mockRestore();
    });

    it('pageToMoveInt larger than insertBeforePageInt', async () => {
      const spyCoreMovePages = jest
        .spyOn(core, 'movePages')
        .mockImplementation(() => Promise.resolve());
      const spyDispatch = jest
        .spyOn(store, 'dispatch')
        .mockImplementation(() => {});
      const spyOnLoadThumbs = jest
        .spyOn(manipulation, 'onLoadThumbs')
        .mockImplementation(() => ({ src: 'thumb' }));

      await manipulation.executeMovePage({
        option: { insertBeforePage: 2, pagesToMove: 3 },
        needUpdateThumbnail: true,
        thumbs: [{}],
      });

      expect(spyCoreMovePages).toHaveBeenCalledWith([3], 2);
      expect(spyDispatch).toHaveBeenCalled();
      expect(spyOnLoadThumbs).toHaveBeenCalled();

      spyDispatch.mockRestore();
      spyCoreMovePages.mockRestore();
    });

    it('should not call movePages or dispatch if pagesToMove equals insertBeforePage', async () => {
      const spyCoreMovePages = jest.spyOn(core, 'movePages').mockImplementation(() => Promise.resolve());
      const spyDispatch = jest.spyOn(store, 'dispatch').mockImplementation(() => {});
      const spyOnLoadThumbs = jest.spyOn(manipulation, 'onLoadThumbs').mockImplementation(() => ({}));
      const spyUpdateView = jest.spyOn(core, 'updateView').mockImplementation(() => {});
  
      await manipulation.executeMovePage({
        option: { pagesToMove: 2, insertBeforePage: 2 },
        needUpdateThumbnail: true,
        thumbs: [{}],
      });
  
      expect(spyCoreMovePages).not.toHaveBeenCalled();
      expect(spyDispatch).not.toHaveBeenCalled();
      expect(spyOnLoadThumbs).not.toHaveBeenCalled();
      expect(spyUpdateView).toHaveBeenCalled();
  
      spyCoreMovePages.mockRestore();
      spyDispatch.mockRestore();
      spyOnLoadThumbs.mockRestore();
      spyUpdateView.mockRestore();
    });


  it('should skip updating thumbnails if needUpdateThumbnail is false', async () => {
    const spyCoreMovePages = jest.spyOn(core, 'movePages').mockImplementation(() => Promise.resolve());
    const spyDispatch = jest.spyOn(store, 'dispatch').mockImplementation(() => {});
    const spyOnLoadThumbs = jest.spyOn(manipulation, 'onLoadThumbs').mockImplementation(() => ({ src: 'thumb' }));
    const spyUpdateView = jest.spyOn(core, 'updateView').mockImplementation(() => {});

    await manipulation.executeMovePage({
      option: { pagesToMove: 1, insertBeforePage: 2 },
      needUpdateThumbnail: false, // <-- triggers the branch
      thumbs: [{}],
    });

    expect(spyCoreMovePages).toHaveBeenCalled();
    expect(spyDispatch).not.toHaveBeenCalled();
    expect(spyOnLoadThumbs).not.toHaveBeenCalled();
    expect(spyUpdateView).toHaveBeenCalled();

    spyCoreMovePages.mockRestore();
    spyDispatch.mockRestore();
    spyOnLoadThumbs.mockRestore();
    spyUpdateView.mockRestore();
  });
  });

  describe('executeRemovePage', () => {
    it('should update thumb list', async () => {
      const spyCoreGetTotalPages = jest
        .spyOn(core, 'getTotalPages')
        .mockImplementation(() => 5);
      const spyCoreRemovePages = jest
        .spyOn(core, 'removePages')
        .mockImplementation(() => Promise.resolve());
      const spyDispatch = jest
        .spyOn(store, 'dispatch')
        .mockImplementation(() => {});
      await manipulation.executeRemovePage({
        option: {
          pagesRemove: [1],
        },
        needUpdateThumbnail: true,
        thumbs: [{}, {}],
      });

      expect(spyDispatch).toHaveBeenCalled();
      expect(spyCoreRemovePages).toHaveBeenCalled();
      expect(core.updateView).toHaveBeenCalled();
      spyCoreGetTotalPages.mockRestore();
      spyDispatch.mockRestore();
      spyCoreRemovePages.mockRestore();
    });

    it('should prevent removing all pages when uniquePagesToRemove.length >= totalPages', async () => {
      const spyCoreGetTotalPages = jest
        .spyOn(core, 'getTotalPages')
        .mockImplementation(() => 3);
      const spyCoreRemovePages = jest
        .spyOn(core, 'removePages')
        .mockImplementation(() => Promise.resolve());
      const spyCoreDisableReadOnlyMode = jest
        .spyOn(core, 'disableReadOnlyMode')
        .mockImplementation(() => {});

      await manipulation.executeRemovePage({
        option: {
          pagesRemove: [1, 2, 3],
        },
        needUpdateThumbnail: true,
        thumbs: [{}, {}, {}],
      });

      expect(spyCoreGetTotalPages).toHaveBeenCalled();
      expect(spyCoreRemovePages).not.toHaveBeenCalled();
      expect(spyCoreDisableReadOnlyMode).not.toHaveBeenCalled();
      expect(core.updateView).not.toHaveBeenCalled();
      spyCoreGetTotalPages.mockRestore();
      spyCoreRemovePages.mockRestore();
      spyCoreDisableReadOnlyMode.mockRestore();
    });

    it('should correctly remove pages when uniquePagesToRemove.length < totalPages', async () => {
      const spyCoreGetTotalPages = jest
        .spyOn(core, 'getTotalPages')
        .mockImplementation(() => 5);
      const spyCoreRemovePages = jest
        .spyOn(core, 'removePages')
        .mockImplementation(() => Promise.resolve());
      const spyCoreDisableReadOnlyMode = jest
        .spyOn(core, 'disableReadOnlyMode')
        .mockImplementation(() => {});
      const spyDispatch = jest
        .spyOn(store, 'dispatch')
        .mockImplementation(() => {});

      await manipulation.executeRemovePage({
        option: {
          pagesRemove: [1, 3],
        },
        needUpdateThumbnail: true,
        thumbs: [{}, {}, {}, {}, {}],
      });

      expect(spyCoreGetTotalPages).toHaveBeenCalled();
      expect(spyCoreDisableReadOnlyMode).toHaveBeenCalled();
      expect(spyCoreRemovePages).toHaveBeenCalledWith([1, 3]);
      expect(core.updateView).toHaveBeenCalled();
      spyCoreGetTotalPages.mockRestore();
      spyCoreRemovePages.mockRestore();
      spyCoreDisableReadOnlyMode.mockRestore();
      spyDispatch.mockRestore();
    });

    it('should correctly handle duplicate page numbers in pagesRemove array', async () => {
      const spyCoreGetTotalPages = jest
        .spyOn(core, 'getTotalPages')
        .mockImplementation(() => 5);
      const spyCoreRemovePages = jest
        .spyOn(core, 'removePages')
        .mockImplementation(() => Promise.resolve());
      const spyCoreDisableReadOnlyMode = jest
        .spyOn(core, 'disableReadOnlyMode')
        .mockImplementation(() => {});
      const spyDispatch = jest
        .spyOn(store, 'dispatch')
        .mockImplementation(() => {});

      // Pass duplicate page numbers [2, 2, 3, 3, 2]
      // uniquePagesToRemove should be [2, 3] with length 2
      // Since 2 < 5 (totalPages), pages should be removed
      await manipulation.executeRemovePage({
        option: {
          pagesRemove: [2, 2, 3, 3, 2],
        },
        needUpdateThumbnail: true,
        thumbs: [{}, {}, {}, {}, {}],
      });

      expect(spyCoreGetTotalPages).toHaveBeenCalled();
      expect(spyCoreDisableReadOnlyMode).toHaveBeenCalled();
      // Should be called with the original array (duplicates included)
      expect(spyCoreRemovePages).toHaveBeenCalledWith([2, 2, 3, 3, 2]);
      expect(core.updateView).toHaveBeenCalled();
      spyCoreGetTotalPages.mockRestore();
      spyCoreRemovePages.mockRestore();
      spyCoreDisableReadOnlyMode.mockRestore();
      spyDispatch.mockRestore();
    });
  });

  describe('executeInsertBlankPage', () => {
    it('should update thumb list', async () => {
      const spyCoreInsertBlankPage = jest
        .spyOn(core, 'insertBlankPages')
        .mockImplementation(() => Promise.resolve());
      const spyDispatch = jest
        .spyOn(store, 'dispatch')
        .mockImplementation(() => {});
      const spyOnLoadThumbs = jest
        .spyOn(manipulation, 'onLoadThumbs')
        .mockImplementation(() => ({
          className: '',
          width: 100,
          height: 100,
          src: '',
        }));
      await manipulation.executeInsertBlankPage({
        option: {
          insertPages: [0],
        },
        needUpdateThumbnail: true,
        thumbs: [{}, {}],
      });

      expect(spyDispatch).toHaveBeenCalled();
      expect(spyCoreInsertBlankPage).toHaveBeenCalled();
      expect(core.updateView).toHaveBeenCalled();
      spyDispatch.mockRestore();
      spyCoreInsertBlankPage.mockRestore();
      spyOnLoadThumbs.mockRestore();
    });

    it('should skip thumbnail update if thumbs is empty', async () => {
      const spyCoreInsertBlankPage = jest.spyOn(core, 'insertBlankPages').mockImplementation(() => Promise.resolve());
      const spyDispatch = jest.spyOn(store, 'dispatch').mockImplementation(() => {});
      const spyUpdateView = jest.spyOn(core, 'updateView').mockImplementation(() => {});
      await manipulation.executeInsertBlankPage({
        option: { insertPages: [0] },
        needUpdateThumbnail: true,
        thumbs: [],
      });

      expect(spyCoreInsertBlankPage).toHaveBeenCalled();
      expect(spyDispatch).not.toHaveBeenCalled();
      expect(spyUpdateView).toHaveBeenCalled();

      spyCoreInsertBlankPage.mockRestore();
      spyDispatch.mockRestore();
      spyUpdateView.mockRestore();
    });
  });

  describe('executeCropPage', () => {
    it('should update thumb list', async () => {
      const spyCoreCropPage = jest
        .spyOn(core, 'cropPages')
        .mockImplementation(() => Promise.resolve());
      const spyDispatch = jest
        .spyOn(store, 'dispatch')
        .mockImplementation(() => {});
      const spyOnLoadThumbs = jest
        .spyOn(manipulation, 'onLoadThumbs')
        .mockImplementation(() => ({
          className: '',
          width: 100,
          height: 100,
          src: '',
        }));
      await manipulation.executeCropPage({
        option: {
          pageCrops: [0],
          top: 1,
          left: 1,
          right: 1,
          bottom: 2,
        },
        needUpdateThumbnail: true,
        thumbs: [{}, {}],
      });

      expect(spyDispatch).toHaveBeenCalled();
      expect(spyCoreCropPage).toHaveBeenCalled();
      expect(core.updateView).toHaveBeenCalled();
      spyDispatch.mockRestore();
      spyCoreCropPage.mockRestore();
      spyOnLoadThumbs.mockRestore();
    });

    it('should skip thumbnail update if thumbs is empty', async () => {
      const spyCoreCropPage = jest.spyOn(core, 'cropPages').mockImplementation(() => Promise.resolve());
      const spyDispatch = jest.spyOn(store, 'dispatch').mockImplementation(() => {});
      const spyUpdateView = jest.spyOn(core, 'updateView').mockImplementation(() => {});
      await manipulation.executeCropPage({
        option: { pageCrops: [0], top: 1, left: 1, right: 1, bottom: 2 },
      });
      expect(spyCoreCropPage).toHaveBeenCalled();
      expect(spyDispatch).not.toHaveBeenCalled();
      expect(spyUpdateView).toHaveBeenCalled();

      spyCoreCropPage.mockRestore();
      spyDispatch.mockRestore();
      spyUpdateView.mockRestore();
    });
  });

  describe('executeManipulationFromData', () => {
    it('executeRotate should be called', async () => {
      const param = {
        data: {
          type: MANIPULATION_TYPE.ROTATE_PAGE,
        },
        thumbs: [],
      };
      const spyRotatePage = jest.spyOn(manipulation, 'executeRotate').mockImplementation(() => Promise.resolve());
      await manipulation.executeManipulationFromData(param);
      expect(spyRotatePage).toHaveBeenCalled();
      spyRotatePage.mockRestore();
    });

    it('executeMovePage should be called', async () => {
      const param = {
        data: {
          type: MANIPULATION_TYPE.MOVE_PAGE,
        },
        needUpdateThumbnail: true,
        thumbs: [],
      };
      const spyMovePage = jest.spyOn(manipulation, 'executeMovePage').mockImplementation(() => Promise.resolve());
      await manipulation.executeManipulationFromData(param);
      expect(spyMovePage).toHaveBeenCalled();
      spyMovePage.mockRestore();
    });

    it('executeRemovePage should be called', async () => {
      const param = {
        data: {
          type: MANIPULATION_TYPE.REMOVE_PAGE,
        },
        needUpdateThumbnail: true,
        thumbs: [],
      };
      const spyRemovePage = jest.spyOn(manipulation, 'executeRemovePage').mockImplementation(() => Promise.resolve());
      await manipulation.executeManipulationFromData(param);
      expect(spyRemovePage).toHaveBeenCalled();
      spyRemovePage.mockRestore();
    });

    it('executeInsertBlankPage should be called', async () => {
      const param = {
        data: {
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
        },
        needUpdateThumbnail: true,
        thumbs: [],
      };
      const spyInsertBlankPage = jest.spyOn(manipulation, 'executeInsertBlankPage').mockImplementation(() => Promise.resolve());
      await manipulation.executeManipulationFromData(param);
      expect(spyInsertBlankPage).toHaveBeenCalled();
      spyInsertBlankPage.mockRestore();
    });

    it('executeCropPage should be called', async () => {
      const param = {
        data: {
          type: MANIPULATION_TYPE.CROP_PAGE,
        },
        needUpdateThumbnail: true,
        thumbs: [],
      };
      const spyCropPage = jest.spyOn(manipulation, 'executeCropPage').mockImplementation(() => Promise.resolve());
      await manipulation.executeManipulationFromData(param);
      expect(spyCropPage).toHaveBeenCalled();
      spyCropPage.mockRestore();
    });

    it('executeMergePage should be called', async () => {
      const param = {
        data: {
          type: MANIPULATION_TYPE.MERGE_PAGE,
        },
      };
      await manipulation.executeManipulationFromData(param);
    });

    it('empty parameter', async () => {
      const param = {
        data: {
          type: '',
        },
      };
      await manipulation.executeManipulationFromData(param);
    });
  });

  describe('renameAnnotAndWidget', () => {
    it('should rename annot and widget elements', () => {
      const mockSetTransform = jest.fn();
      core.setPagesUpdatedInternalAnnotationsTransform = mockSetTransform;
  
      manipulation.renameAnnotAndWidget();
  
      expect(mockSetTransform).toHaveBeenCalledTimes(1);
  
      const callbackFn = mockSetTransform.mock.calls[0][0];
  
      const originalData = `
        <xfdf>
          <annots>
            <annot name="a1" inreplyto="a0">
              <apref>some</apref>
              <trn-custom-data bytes='{"isHighlightComment":true,"stickyLinkId":"a0"}'></trn-custom-data>
            </annot>
          </annots>
          <fields>
            <field name="f1"></field>
          </fields>
          <pdf-info>
            <ffield name="f1"></ffield>
            <widget field="f1"></widget>
          </pdf-info>
        </xfdf>
      `;
  
      let xfdfResult = '';
      callbackFn(originalData, [], (result) => {
        xfdfResult = result;
      });
  
      expect(xfdfResult).not.toBeNull();
      expect(xfdfResult).toContain('f1_');
    });
  });

  describe('executeMergePage', () => {
    it('should call insertPages after annotations are loaded', async () => {
      const docInstance = {};
      const rangesArray = [1, 2];
      const positionToMerge = 3;
  
      core.docViewer = {
        getAnnotationsLoadedPromise: jest.fn().mockResolvedValue(undefined),
      };
      core.getDocument = jest.fn().mockReturnValue({
        insertPages: jest.fn().mockResolvedValue(undefined),
      });
  
      await manipulation.executeMergePage({ docInstance, rangesArray, positionToMerge });
  
      expect(core.docViewer.getAnnotationsLoadedPromise).toHaveBeenCalled();
      expect(core.getDocument().insertPages).toHaveBeenCalledWith(
        docInstance,
        rangesArray,
        positionToMerge
      );
    });
  });
  
});

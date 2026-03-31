/* eslint-disable */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';

import { createStore, createState } from 'src/redux/mockStore';
import AutoMockedApollo from 'src/apollo/mockApollo';
import selectors from 'selectors';
import core from 'core';
import SignatureModalLumin from '../SignatureModalLumin';
import { useThemeProvider } from 'hooks';
import ViewerContext from '../../../screens/Viewer/Context';

class MockStampAnnotation {}

jest.mock('utils/signature');
jest.mock('utils/getColorFromStyle');
jest.mock('core', () => ({
  getTool: jest.fn().mockImplementation(() => ({
    isEmptySignature: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    resizeCanvas: jest.fn(),
    clearSignatureCanvas: jest.fn(),
    clearLocation: jest.fn(),
    annot: null,
    setSignatureCanvas: jest.fn(),
    setSignature: jest.fn(),
    showPreview: jest.fn(),
    hasLocation: jest.fn(),
  })),
  addEventListener: jest.fn(),
  setToolMode: jest.fn(),
  removeEventListener: jest.fn(),
}));

jest.mock('utils/signature', () => ({
  getNumberOfSignatures: jest.fn(),
  handleSignature: jest.fn(),
}));

jest.mock('services/graphServices/documentGraphServices', () => ({
  getPresignedUrlForSignature: jest.fn().mockReturnValue({ presignedUrl: '', remoteId: ''})
}))

jest.mock('services/documentServices', () => ({
  uploadFileToS3: jest.fn()
}))

const ThemeWrapper = ({ children }) => {
  const theme = useThemeProvider();
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}

const context = {
  isLoadingDocument: false,
}

const ProxyContainer = ({ ...rest }) => (
  <MemoryRouter>
    <ViewerContext.Provider value={context}>
      <AutoMockedApollo
        mockResolvers={{
          deleteSignatureByIndex: () => {},
        }}
      >
        <Provider store={createStore()}>
          <ThemeWrapper>
            <SignatureModalLumin {...rest} />
          </ThemeWrapper>
        </Provider>
      </AutoMockedApollo>
    </ViewerContext.Provider>
  </MemoryRouter>
);

describe('<SignatureModalLumin />', () => {
  const setup = (propOverrides = {}, storeOverrides = {}) => {
    const state = createState(storeOverrides);
    const defaultProps = {
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      openElement: jest.fn(),
      setCurrentUser: jest.fn(),
      setIsSavingSignature: jest.fn(),
      setSelectedSignature: jest.fn(),
      setPlacingMultipleSignatures: jest.fn(),
      t: jest.fn(),
      match: {
        params: {},
      },
      isDisabled: selectors.isElementDisabled(state, 'signatureModal'),
      isOpen: selectors.isElementOpen(state, 'signatureModal'),
      activeToolStyles: selectors.getActiveToolStyles(state),
      currentUser: selectors.getCurrentUser(state),
      currentDocument: {
        premiumToolsInfo: {
          maximumNumberSignature: 2,
        },
      },
      client: {
        mutate: jest.fn().mockImplementation(() => Promise.resolve(true)),
      },
      setIsFetchingSignatures: jest.fn(),
      signatureStatus: {
        isFetching: false,
        signatureQueue: [],
        isSyncing: false,
        hasNext: false,
      },
      ...propOverrides,
    };

    const wrapper = mount(<ProxyContainer {...defaultProps} />);
    const signatureWrapper = wrapper.find('SignatureModalLumin');
    const instance = signatureWrapper.instance();
    instance.signatureTool.getFullSignatureAnnotation = jest.fn().mockImplementation(() => ({
      annotation: {
        ToolName: 'AnnotationCreateSignature'
      }
    }));
    instance.signatureTool.removeEventListener = jest.fn();
    return {
      defaultProps,
      wrapper,
      signatureWrapper,
      instance,
    };
  };

  beforeAll(() => {
    global.document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      },
    });
    global.Core= {
      Annotations: {
        StampAnnotation: MockStampAnnotation,
      },
      getCanvasMultiplier: jest.fn().mockReturnValue(10),
    };
    HTMLCanvasElement.prototype.toDataURL = () => 'url';
    HTMLCanvasElement.prototype.getContext = () => ({
      scale: jest.fn(),
      clearRect: jest.fn(),
      stroke: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn().mockReturnValueOnce(true),
    });
  });

  describe('Smoke test', () => {
    it('Renders without crashing', () => {
      const { defaultProps } = setup();
      const component = shallow(<SignatureModalLumin {...defaultProps} />);
      expect(component).toMatchSnapshot();
    });

    it('Renders with number signature max', () => {
      const { defaultProps } = setup({
        currentUser: {
          signatures: [
            'signatures/ec4b0e1e-aeb8-4a45-bb4b-655cb326c829.png',
            'signatures/667c849f-5ec8-4b13-97db-908237b0a0de.png',
            'signatures/a39189fd-d7e4-477c-8e51-4115e6667250.png',
            'signatures/732ff0b4-1c00-40a9-bb99-eb3bb2f71e5a.png',
            'signatures/b0c22367-43d8-4eb4-9b91-aac3f93f2e81.png',
            'signatures/fd5dae9e-6b52-4228-ad0a-a597ffc04253.png',
            'signatures/fd5dae9e-6b52-4228-ad0a-a597ffc04253.png',
            'signatures/fd5dae9e-6b52-4228-ad0a-a597ffc04253.png',
            'signatures/fd5dae9e-6b52-4228-ad0a-a597ffc04253.png',
            'signatures/fd5dae9e-6b52-4228-ad0a-a597ffc04253.png',
            'signatures/fd5dae9e-6b52-4228-ad0a-a597ffc04253.png',
            'signatures/fd5dae9e-6b52-4228-ad0a-a597ffc04253.png',
          ],
          payment: {
            type: 'PROFESSIONAL',
          },
        },
        currentDocument: {
          premiumToolsInfo: {
            maximumNumberSignature: 100,
          }
        }
      });
      const component = shallow(<SignatureModalLumin {...defaultProps} />);
      expect(component).toMatchSnapshot();
    });
  });

  describe('Component did update', async () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });
    it('should fire resize canvas when dimension changed', () => {
      const { instance } = setup();
      instance.setState({
        dimension: {
          height: 100,
          width: 100,
        },
      });
      expect(instance.signatureTool.resizeCanvas).toHaveBeenCalled();
    });

    it('should fire setup signature canvas', () => {
      const { wrapper, instance } = setup();
      const setUpSignatureCanvas = jest.spyOn(instance, 'setUpSignatureCanvas');
      instance.isCanvasReady = false;
      wrapper.setProps({
        isDisabled: true,
      });
      wrapper.setProps({
        isDisabled: false,
      });
      expect(setUpSignatureCanvas).toHaveBeenCalled();
    });

    it('should setup signature tool if modal open', () => {
      const { wrapper, instance } = setup();
      wrapper.setProps({
        isOpen: false,
      });
      wrapper.setProps({
        isOpen: true,
      });
      expect(instance.props.closeElements).toHaveBeenCalled();
    });

    jest.useFakeTimers();
    it('should redraw canvas when open style modal', () => {
      const { wrapper, instance } = setup();
      instance.signatureTool.annot = {};
      act(() => {
        instance.setState({
          openStyle: true,
        });
        jest.runAllTimers();
      });
      wrapper.setProps({
        activeToolStyles: { StrokeColor: { toHexString: () => '#ffffff' } },
      });
      wrapper.setProps({
        activeToolStyles: {
          tool: 'signatureTool',
          StrokeColor: { toHexString: () => '#ffffff' },
        },
      });
      expect(instance.signatureTool.isEmptySignature).toHaveBeenCalled();
    });

    it('should return if annotation of signature tool is null', () => {
      const { wrapper, instance } = setup();
      instance.signatureTool.annot = {};
      act(() => {
        instance.setState({
          openStyle: true,
        });
        jest.runAllTimers();
      });
      wrapper.setProps({
        activeToolStyles: { StrokeColor: { toHexString: () => '#ffffff' } },
      });
      wrapper.setProps({
        activeToolStyles: {
          tool: 'signatureTool',
          StrokeColor: { toHexString: () => '#ffffff' },
        },
      });
      expect(instance.signatureTool.isEmptySignature).toHaveBeenNthCalledWith(2);
    });

    it('should return maximum number signature 2 if user in free plan', () => {
      const { wrapper, instance } = setup();
      wrapper.setProps({
        currentDocument: {
          premiumToolsInfo: {
            maximumNumberSignature: 2,
          }
        }
      });
      instance.signatureTool.annot = {};
      expect(instance.props.currentDocument.premiumToolsInfo.maximumNumberSignature).toEqual(2);
    });

    it('should return maximum number signature 6 if user in personal or free_trial plan', () => {
      const { wrapper, instance } = setup();
      wrapper.setProps({
        currentUser: {
          payment: {
            type: 'FREE_TRIAL',
          }
        },
        currentDocument: {
          premiumToolsInfo: {
            maximumNumberSignature: 100,
          }
        }
      });
      instance.signatureTool.annot = {};
      expect(instance.props.currentDocument.premiumToolsInfo.maximumNumberSignature).toEqual(100);
    });

    it('should return maximum number signature 100 if user in professional plan', () => {
      const { wrapper, instance } = setup();
      wrapper.setProps({
        currentUser: {
          payment: {
            type: 'PROFESSIONAL',
          },
        },
        currentDocument: {
          premiumToolsInfo: {
            maximumNumberSignature: 100,
          }
        }
      });
      instance.signatureTool.annot = {};
      expect(instance.props.currentDocument.premiumToolsInfo.maximumNumberSignature).toEqual(100);
    });
  });

  describe('handleSignatureAdded', () => {
    it('should call notifyAddNewSignatureToDb function', () => {
      core.getAnnotationManager = jest.fn().mockImplementation(() => ({
        redrawAnnotation: jest.fn(),
      }));
      const { instance } = setup();
      const handleCreateSignature = jest.spyOn(instance, 'handleCreateSignature');
      instance.coordinates = {
        x: 0,
        y: 0,
      };
      instance.signatureAdded = true;
      instance.handleSignatureAdded({
        ToolName: 'AnnotationCreateSignature',
        resourcesLoaded: jest.fn().mockImplementation(() => Promise.resolve()),
        getImageData: jest.fn().mockImplementation(() => Promise.resolve({ replaceAll: jest.fn()} )),
        Id: '',
      }).then(() => expect(handleCreateSignature).toBeCalled());
    });
  });

  describe('createSignature', () => {
    it('should create free hand signature without error', async () => {
      const { instance } = setup();
      act(() => {
        instance.setState({
          selectedSignatureType: 0,
        });
        jest.runAllTimers();
      });
      await instance.createSignature();
      expect(instance.signatureTool.setSignature).toBeCalled();
    });

    it('should create image signature without error', async () => {
      const { instance } = setup();
      act(() => {
        instance.setState({
          selectedSignatureType: 1,
        });
        jest.runAllTimers();
      });
      await instance.createSignature();
      expect(instance.signatureTool.setSignature).toBeCalled();
    });

    it('should create text signature without error with short text', async () => {
      const { instance, wrapper } = setup();
      wrapper.setProps({
        activeToolStyles: {
          StrokeColor: {
            R: 255,
            G: 255,
            B: 255,
            Opacity: 1,
          },
        },
      });
      act(() => {
        instance.setState({
          selectedSignatureType: 2,
          textSignature: 'nhuttm',
        });
        jest.runAllTimers();
      });
      await instance.createSignature();
      expect(instance.signatureTool.setSignature).toBeCalled();
    });

    it('should create text signature without error with long text', async () => {
      const { instance, wrapper } = setup();
      wrapper.setProps({
        activeToolStyles: {
          StrokeColor: {
            R: 255,
            G: 255,
            B: 255,
            Opacity: 1,
          },
        },
      });
      act(() => {
        instance.setState({
          selectedSignatureType: 2,
          textSignature:
            'nhuttmnhuttmnhuttmnhuttmnhuttmnhuttmnhuttmnhuttmnhuttmnhuttm',
        });
        jest.runAllTimers();
      });
      await instance.createSignature();
      expect(instance.signatureTool.setSignature).toBeCalled();
    });

    it('should not create text signature with empty text', async () => {
      const { instance, wrapper } = setup();
      wrapper.setProps({
        activeToolStyles: {
          StrokeColor: {
            R: 255,
            G: 255,
            B: 255,
            Opacity: 1,
          },
        },
      });
      act(() => {
        instance.setState({
          selectedSignatureType: 2,
        });
        jest.runAllTimers();
      });
      await instance.createSignature();
      expect(instance.signatureTool.setSignature).not.toBeCalled();
    });

    it('should not called setSignature function if selectedSignatureType is invalid', async () => {
      const { instance } = setup();
      act(() => {
        instance.setState({
          selectedSignatureType: 3,
        });
        jest.runAllTimers();
      });
      await instance.createSignature();
      expect(instance.signatureTool.setSignature).not.toBeCalled();
    });
  });

  describe('clearSignature', () => {
    it('should clear free hand signature without error', async () => {
      const { instance } = setup();
      act(() => {
        instance.setState({
          selectedSignatureType: 0,
        });
        jest.runAllTimers();
      });
      await instance.clearSignature();
      expect(instance.signatureTool.clearSignatureCanvas).toBeCalled();
    });

    it('should clear image signature without error', async () => {
      const { signatureWrapper, instance } = setup();
      act(() => {
        instance.setState({
          selectedSignatureType: 1,
        });
        jest.runAllTimers();
      });
      await instance.clearSignature();
      expect(signatureWrapper.state('imageSignature')).toEqual(false);
    });

    it('should clear text signature without error', async () => {
      const { wrapper, signatureWrapper, instance } = setup();
      wrapper.setProps({
        activeToolStyles: {
          StrokeColor: {
            R: 255,
            G: 255,
            B: 255,
            Opacity: 1,
          },
        },
      });
      act(() => {
        instance.setState({
          selectedSignatureType: 2,
        });
        jest.runAllTimers();
      });
      await instance.clearSignature();
      expect(signatureWrapper.state('textSignature')).toEqual('');
    });

    it('should return if wrong selected type signature', async () => {
      const { instance } = setup();
      act(() => {
        instance.setState({
          selectedSignatureType: 3,
        });
        jest.runAllTimers();
      });
      await instance.clearSignature();
      expect(instance.signatureTool.clearSignatureCanvas).not.toBeCalled();
    });
  });

  describe('_handleUploadFile', () => {
    it('should create image data success', async () => {
      const { signatureWrapper, instance } = setup();
      const fileMock = new File([''], 'filename', { type: 'image/png' });
      const readAsDataURL = jest.spyOn(FileReader.prototype, 'readAsDataURL');
      const event = {
        target: {
          files: [fileMock],
        },
      };
      instance._handleUploadFile(event);
      expect(readAsDataURL).toBeCalledWith(fileMock);
    });
  });

  describe('convertPtToFontWeight', () => {
    it('should return font weight normal if pt < 6', () => {
      const { instance } = setup();
      const fontWeight = instance.convertPtToFontWeight(5);
      expect(fontWeight).toEqual('normal');
    });
  });

  describe('isDisabledButton', () => {
    it('should disable button create if imageSignature is null', () => {
      const { instance } = setup();
      instance.setState({
        selectedSignatureType: 1,
        imageSignature: null,
      });
      const isDisabled = instance.state.isDisabledButton;
      expect(isDisabled).toEqual(true);
    });

    it('should disable button create if textSignature is empty', () => {
      const { wrapper, instance } = setup();
      wrapper.setProps({
        activeToolStyles: {
          StrokeColor: {
            R: 255,
            G: 255,
            B: 255,
            Opacity: 1,
          },
        },
      });
      instance.setState({
        selectedSignatureType: 2,
        textSignature: '',
      });
      const isDisabled = instance.state.isDisabledButton;
      expect(isDisabled).toEqual(true);
    });
  });
});

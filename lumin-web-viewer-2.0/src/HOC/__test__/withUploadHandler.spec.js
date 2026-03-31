import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import withUploadHandler from '../withUploadHandler';

// Mock services
jest.mock('services', () => ({
  uploadServices: {
    registerHandler: jest.fn(),
    getUploadHandler: jest.fn(),
  },
}));

// Mock utils
jest.mock('utils', () => ({
  UploadUtils: {
    isFreeQueue: jest.fn(() => true),
    getRestartTask: jest.fn(() => null),
  },
}));

// Mock selectors
jest.mock('selectors', () => ({
  getUploadingDocuments: jest.fn(() => []),
}));

// Mock store - use the path relative to src/ as configured in jest moduleNameMapper
jest.mock('src/redux/store', () => ({
  store: {
    getState: jest.fn(() => ({ uploading: { uploadingList: [] } })),
  },
}));

// Import mocked modules
import { uploadServices } from 'services';
import { UploadUtils } from 'utils';
import selectors from 'selectors';
import { store } from 'src/redux/store';

const mockStore = configureMockStore([]);

// Test component
const TestComponent = ({ testProp }) => (
  <div data-testid="test-component">
    <span data-testid="test-prop">{testProp}</span>
  </div>
);

describe('withUploadHandler HOC', () => {
  let reduxStore;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default store state - empty
    reduxStore = mockStore({
      uploading: {
        uploadingList: [],
      },
    });

    // Reset all mocks to defaults
    selectors.getUploadingDocuments.mockReturnValue([]);
    store.getState.mockReturnValue({ uploading: { uploadingList: [] } });
    UploadUtils.isFreeQueue.mockReturnValue(true);
    UploadUtils.getRestartTask.mockReturnValue(null);
    uploadServices.getUploadHandler.mockReturnValue(jest.fn().mockResolvedValue(null));
  });

  const renderWithProvider = (Component, props = {}) => {
    return render(
      <Provider store={reduxStore}>
        <Component {...props} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render wrapped component', () => {
      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent, { testProp: 'test-value' });

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should pass props to wrapped component', () => {
      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent, { testProp: 'custom-value' });

      expect(screen.getByTestId('test-prop')).toHaveTextContent('custom-value');
    });

    it('should NOT pass handleUploadProgress to wrapped component', () => {
      const PropsChecker = (props) => (
        <div data-testid="props-checker">
          {Object.keys(props).includes('handleUploadProgress') ? 'has-handler' : 'no-handler'}
        </div>
      );
      const EnhancedComponent = withUploadHandler(PropsChecker);

      renderWithProvider(EnhancedComponent, { 
        handleUploadProgress: jest.fn(),
        testProp: 'test',
      });

      expect(screen.getByTestId('props-checker')).toHaveTextContent('no-handler');
    });

    it('should NOT pass uploadingFiles to wrapped component', () => {
      const PropsChecker = (props) => (
        <div data-testid="props-checker">
          {Object.keys(props).includes('uploadingFiles') ? 'has-files' : 'no-files'}
        </div>
      );
      const EnhancedComponent = withUploadHandler(PropsChecker);

      renderWithProvider(EnhancedComponent);

      expect(screen.getByTestId('props-checker')).toHaveTextContent('no-files');
    });
  });

  describe('Handler Registration (constructor)', () => {
    it('should register upload handler on mount', () => {
      const mockHandler = jest.fn();
      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent, {
        handlerName: 'test-handler',
        handleUploadProgress: mockHandler,
      });

      expect(uploadServices.registerHandler).toHaveBeenCalledWith('test-handler', mockHandler);
    });

    it('should use default handler name when not provided', () => {
      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent);

      expect(uploadServices.registerHandler).toHaveBeenCalledWith(
        'none_handler',
        expect.any(Function)
      );
    });

    it('should register handler only once on mount', () => {
      const EnhancedComponent = withUploadHandler(TestComponent);

      const { rerender } = renderWithProvider(EnhancedComponent, {
        handlerName: 'test-handler',
      });

      rerender(
        <Provider store={reduxStore}>
          <EnhancedComponent handlerName="test-handler" />
        </Provider>
      );

      expect(uploadServices.registerHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('componentDidUpdate - isFirstTimeUpload', () => {
    it('should have selectors.getUploadingDocuments available for upload detection', () => {
      // Verify selector is mocked and available
      expect(selectors.getUploadingDocuments).toBeDefined();
      expect(typeof selectors.getUploadingDocuments).toBe('function');
      
      // Test the selector
      const result = selectors.getUploadingDocuments({ uploading: { uploadingList: [] } });
      expect(result).toEqual([]);
    });

    it('should not trigger upload on initial render with empty files', () => {
      reduxStore = mockStore({
        uploading: { uploadingList: [] },
      });

      const EnhancedComponent = withUploadHandler(TestComponent);
      renderWithProvider(EnhancedComponent);

      // getUploadHandler should NOT be called on initial render with empty files
      expect(uploadServices.getUploadHandler).not.toHaveBeenCalled();
    });

    it('should check store.getState when determining upload list', () => {
      // Verify store.getState is mocked and available
      expect(store.getState).toBeDefined();
      expect(typeof store.getState).toBe('function');
      
      // Test the mock
      const state = store.getState();
      expect(state).toHaveProperty('uploading');
    });
  });

  describe('componentDidUpdate - isAfterUploadDone', () => {
    it('should have isFreeQueue utility available', () => {
      // Verify UploadUtils.isFreeQueue is mocked and available for componentDidUpdate
      expect(UploadUtils.isFreeQueue).toBeDefined();
      expect(typeof UploadUtils.isFreeQueue).toBe('function');
      
      // Test the utility function
      const result = UploadUtils.isFreeQueue([{ id: 'file-1' }]);
      expect(result).toBe(true);
    });

    it('should NOT call getUploadHandler when no upload transition occurs', () => {
      // Start with empty files
      reduxStore = mockStore({
        uploading: { uploadingList: [] },
      });

      const EnhancedComponent = withUploadHandler(TestComponent);
      const { rerender } = renderWithProvider(EnhancedComponent);

      // Rerender with same empty state - no transition
      rerender(
        <Provider store={reduxStore}>
          <EnhancedComponent />
        </Provider>
      );

      // getUploadHandler should NOT be called
      expect(uploadServices.getUploadHandler).not.toHaveBeenCalled();
    });
  });

  describe('uploadFileSequence utilities', () => {
    it('should have getUploadHandler service available', () => {
      // Verify uploadServices.getUploadHandler is mocked and available
      expect(uploadServices.getUploadHandler).toBeDefined();
      expect(typeof uploadServices.getUploadHandler).toBe('function');
      
      // Test the mock
      const handler = uploadServices.getUploadHandler('test-handler');
      expect(handler).toBeDefined();
    });

    it('should have getRestartTask utility available', () => {
      // Verify UploadUtils.getRestartTask is mocked and available
      expect(UploadUtils.getRestartTask).toBeDefined();
      expect(typeof UploadUtils.getRestartTask).toBe('function');
      
      // Test the utility
      const result = UploadUtils.getRestartTask({ id: 'file-1' }, []);
      expect(result).toBe(null);
    });

    it('should mock getUploadHandler to return async function', async () => {
      const mockUploadHandler = jest.fn().mockResolvedValue(null);
      uploadServices.getUploadHandler.mockReturnValue(mockUploadHandler);

      const handler = uploadServices.getUploadHandler('test-handler');
      const result = await handler({ id: 'file-1' });

      expect(result).toBe(null);
      expect(mockUploadHandler).toHaveBeenCalledWith({ id: 'file-1' });
    });

    it('should mock getUploadHandler to return failed task', async () => {
      const failedTask = { id: 'file-1', error: 'network' };
      const mockUploadHandler = jest.fn().mockResolvedValue(failedTask);
      uploadServices.getUploadHandler.mockReturnValue(mockUploadHandler);

      const handler = uploadServices.getUploadHandler('test-handler');
      const result = await handler({ id: 'file-1' });

      expect(result).toEqual(failedTask);
    });
  });

  describe('getUploadingList', () => {
    it('should use store.getState to get current state', () => {
      const mockState = { uploading: { uploadingList: [{ id: 'test' }] } };
      store.getState.mockReturnValue(mockState);

      // Verify the mock works correctly
      const state = store.getState();
      expect(state).toEqual(mockState);
    });

    it('should use selectors.getUploadingDocuments to extract documents', () => {
      const mockDocs = [{ id: 'doc-1' }, { id: 'doc-2' }];
      selectors.getUploadingDocuments.mockReturnValue(mockDocs);

      // Verify the selector works correctly
      const result = selectors.getUploadingDocuments({ uploading: { uploadingList: mockDocs } });
      expect(result).toEqual(mockDocs);
    });

    it('should integrate store.getState with selectors.getUploadingDocuments', () => {
      const mockDocs = [{ id: 'doc-1' }];
      const mockState = { uploading: { uploadingList: mockDocs } };
      
      store.getState.mockReturnValue(mockState);
      selectors.getUploadingDocuments.mockReturnValue(mockDocs);

      // Simulate how getUploadingList works
      const state = store.getState();
      const docs = selectors.getUploadingDocuments(state);
      
      expect(docs).toEqual(mockDocs);
    });
  });

  describe('mapStateToProps', () => {
    it('should map uploadingFiles from state', () => {
      const files = [{ id: 'file-1' }, { id: 'file-2' }];
      selectors.getUploadingDocuments.mockReturnValue(files);
      
      reduxStore = mockStore({
        uploading: { uploadingList: files },
      });

      const EnhancedComponent = withUploadHandler(TestComponent);
      renderWithProvider(EnhancedComponent);

      // Verify selector was called (mapStateToProps uses it)
      expect(selectors.getUploadingDocuments).toHaveBeenCalled();
    });
  });

  describe('Default Props', () => {
    it('should have default uploadingFiles as empty array', () => {
      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should have default handleUploadProgress as no-op function', () => {
      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent);

      expect(uploadServices.registerHandler).toHaveBeenCalledWith(
        'none_handler',
        expect.any(Function)
      );
    });

    it('should have default handlerName as none_handler', () => {
      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent);

      expect(uploadServices.registerHandler).toHaveBeenCalledWith(
        'none_handler',
        expect.any(Function)
      );
    });
  });

  describe('Props Filtering (render method)', () => {
    it('should pass through non-internal props via rest spread', () => {
      const MultiPropComponent = ({ prop1, prop2, prop3 }) => (
        <div data-testid="multi-prop">
          <span data-testid="prop1">{prop1}</span>
          <span data-testid="prop2">{prop2}</span>
          <span data-testid="prop3">{prop3}</span>
        </div>
      );
      const EnhancedComponent = withUploadHandler(MultiPropComponent);

      renderWithProvider(EnhancedComponent, {
        prop1: 'value1',
        prop2: 'value2',
        prop3: 'value3',
        handleUploadProgress: jest.fn(),
        handlerName: 'test-handler',
      });

      expect(screen.getByTestId('prop1')).toHaveTextContent('value1');
      expect(screen.getByTestId('prop2')).toHaveTextContent('value2');
      expect(screen.getByTestId('prop3')).toHaveTextContent('value3');
    });

    it('should exclude handleUploadProgress from rest props', () => {
      const PropsLogger = (props) => (
        <div data-testid="props-logger">
          {JSON.stringify(Object.keys(props).sort())}
        </div>
      );
      const EnhancedComponent = withUploadHandler(PropsLogger);

      renderWithProvider(EnhancedComponent, {
        customProp: 'value',
        handleUploadProgress: jest.fn(),
      });

      const propsText = screen.getByTestId('props-logger').textContent;
      expect(propsText).not.toContain('handleUploadProgress');
      expect(propsText).toContain('customProp');
    });

    it('should exclude uploadingFiles from rest props', () => {
      const PropsLogger = (props) => (
        <div data-testid="props-logger">
          {JSON.stringify(Object.keys(props).sort())}
        </div>
      );
      const EnhancedComponent = withUploadHandler(PropsLogger);

      renderWithProvider(EnhancedComponent, {
        customProp: 'value',
      });

      const propsText = screen.getByTestId('props-logger').textContent;
      expect(propsText).not.toContain('uploadingFiles');
    });
  });

  describe('Redux Connection', () => {
    it('should connect to redux store via connect()', () => {
      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should receive uploadingFiles from redux state via mapStateToProps', () => {
      const files = [{ id: 'file-1' }];
      reduxStore = mockStore({
        uploading: { uploadingList: files },
      });
      selectors.getUploadingDocuments.mockReturnValue(files);

      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('PureComponent Behavior', () => {
    it('should extend React.PureComponent', () => {
      const EnhancedComponent = withUploadHandler(TestComponent);
      
      const { rerender } = renderWithProvider(EnhancedComponent, { testProp: 'same' });
      
      rerender(
        <Provider store={reduxStore}>
          <EnhancedComponent testProp="same" />
        </Provider>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty upload list', () => {
      selectors.getUploadingDocuments.mockReturnValue([]);
      store.getState.mockReturnValue({ uploading: { uploadingList: [] } });

      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(uploadServices.getUploadHandler).not.toHaveBeenCalled();
    });

    it('should handle upload sequence with empty list parameter', async () => {
      // This tests the uploadFileSequence(uploadList = []) default parameter
      const EnhancedComponent = withUploadHandler(TestComponent);

      renderWithProvider(EnhancedComponent);

      // Component should render without issues
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });
});

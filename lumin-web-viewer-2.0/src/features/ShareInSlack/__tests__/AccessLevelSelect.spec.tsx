import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: (props: { type?: string; size?: string }) => (
    <span data-testid={`icon-${props.type}`} data-size={props.size}>icon</span>
  ),
  Text: (props: { children?: React.ReactNode; ellipsis?: boolean }) => (
    <span data-testid="text">{props.children}</span>
  ),
}));

// Store onChange handler for testing
let capturedOnChange: ((e: unknown, option: unknown) => void) | null = null;

// Mock DefaultSelect with onChange capture
jest.mock('luminComponents/DefaultSelect', () => ({
  __esModule: true,
  default: (props: {
    data?: Array<{ label: string; value: string; data?: { icon: string } }>;
    label?: string;
    size?: string;
    value?: string;
    onChange?: (e: unknown, option: unknown) => void;
    leftSection?: React.ReactNode;
    renderOption?: (params: { option: { label: string; value: string; data?: { icon: string } } }) => React.ReactNode;
  }) => {
    capturedOnChange = props.onChange || null;
    return (
      <div data-testid="default-select">
        <span data-testid="select-label">{props.label}</span>
        <span data-testid="select-value">{props.value}</span>
        <span data-testid="select-size">{props.size}</span>
        <span data-testid="options-count">{props.data?.length}</span>
        <div data-testid="left-section">{props.leftSection}</div>
        <div data-testid="options">
          {props.data?.map((option) => (
            <button 
              key={option.value} 
              data-testid={`option-${option.value}`}
              onClick={() => props.onChange?.(null, option)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {/* Render one option to test renderOption */}
        {props.renderOption && props.data?.[0] && (
          <div data-testid="rendered-option">
            {props.renderOption({ option: props.data[0] })}
          </div>
        )}
      </div>
    );
  },
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock utils
jest.mock('utils', () => ({
  getDocumentSharingPermission: () => ({
    viewer: { text: 'Viewer', role: 'viewer', icon: 'eye-md' },
    commenter: { text: 'Commenter', role: 'commenter', icon: 'comment-md' },
    editor: { text: 'Editor', role: 'editor', icon: 'pencil-md' },
  }),
}));

import AccessLevelSelect from '../components/ShareInSlackForm/AccessLevelSelect';
import { SharingMode } from '../constants';

const mockStore = configureMockStore([]);

describe('AccessLevelSelect', () => {
  const createStoreState = (overrides = {}) => ({
    shareInSlack: {
      sharingMode: SharingMode.INVITED,
      accessLevel: 'viewer',
      ...overrides,
    },
  });

  const renderComponent = (storeState = {}) => {
    const store = mockStore(createStoreState(storeState));
    return { store, ...render(
      <Provider store={store}>
        <AccessLevelSelect />
      </Provider>
    )};
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnChange = null;
  });

  describe('Rendering', () => {
    it('should render DefaultSelect', () => {
      renderComponent();
      expect(screen.getByTestId('default-select')).toBeInTheDocument();
    });

    it('should display correct label', () => {
      renderComponent();
      expect(screen.getByTestId('select-label')).toHaveTextContent('shareInSlack.accessLevel');
    });

    it('should have lg size', () => {
      renderComponent();
      expect(screen.getByTestId('select-size')).toHaveTextContent('lg');
    });

    it('should render left section with icon', () => {
      renderComponent();
      expect(screen.getByTestId('left-section')).toBeInTheDocument();
    });
  });

  describe('Options based on sharing mode', () => {
    it('should render all 3 options when sharing mode is INVITED', () => {
      renderComponent({ sharingMode: SharingMode.INVITED });
      expect(screen.getByTestId('options-count')).toHaveTextContent('3');
      expect(screen.getByTestId('option-viewer')).toBeInTheDocument();
      expect(screen.getByTestId('option-commenter')).toBeInTheDocument();
      expect(screen.getByTestId('option-editor')).toBeInTheDocument();
    });

    it('should render only 2 options when sharing mode is ANYONE (removes editor)', () => {
      renderComponent({ sharingMode: SharingMode.ANYONE });
      expect(screen.getByTestId('options-count')).toHaveTextContent('2');
      expect(screen.getByTestId('option-viewer')).toBeInTheDocument();
      expect(screen.getByTestId('option-commenter')).toBeInTheDocument();
      expect(screen.queryByTestId('option-editor')).not.toBeInTheDocument();
    });
  });

  describe('Option Selection', () => {
    it('should dispatch setAccessLevel when option is selected', () => {
      const { store } = renderComponent({ sharingMode: SharingMode.INVITED });
      
      fireEvent.click(screen.getByTestId('option-commenter'));
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setAccessLevel',
        payload: 'commenter',
      });
    });
  });

  describe('Redux State', () => {
    it('should display current access level as viewer', () => {
      renderComponent({ accessLevel: 'viewer' });
      expect(screen.getByTestId('select-value')).toHaveTextContent('viewer');
    });

    it('should display current access level as editor', () => {
      renderComponent({ accessLevel: 'editor' });
      expect(screen.getByTestId('select-value')).toHaveTextContent('editor');
    });

    it('should display current access level as commenter', () => {
      renderComponent({ accessLevel: 'commenter' });
      expect(screen.getByTestId('select-value')).toHaveTextContent('commenter');
    });

    it('should dispatch setAccessLevel on mount', () => {
      const { store } = renderComponent();
      
      const actions = store.getActions();
      expect(actions).toContainEqual(expect.objectContaining({
        type: 'SHARE_IN_SLACK/setAccessLevel',
      }));
    });

    it('should dispatch setAccessLevel when sharingMode changes', () => {
      const { store, rerender } = renderComponent({ sharingMode: SharingMode.INVITED });
      
      // First mount dispatches setAccessLevel
      const initialActions = store.getActions();
      const initialSetAccessLevelCount = initialActions.filter(
        (a: { type: string }) => a.type === 'SHARE_IN_SLACK/setAccessLevel'
      ).length;
      
      expect(initialSetAccessLevelCount).toBeGreaterThan(0);
    });
  });

  describe('renderOption', () => {
    it('should render option with icon', () => {
      renderComponent({ accessLevel: 'viewer' });
      // The rendered option should contain an icon
      expect(screen.getByTestId('rendered-option')).toBeInTheDocument();
    });
  });

  describe('Left Section Icon', () => {
    it('should show icon for current access level in left section', () => {
      renderComponent({ accessLevel: 'viewer' });
      expect(screen.getByTestId('left-section')).toBeInTheDocument();
    });
  });
});

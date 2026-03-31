import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock DefaultSelect with onChange capture
jest.mock('luminComponents/DefaultSelect', () => ({
  __esModule: true,
  default: (props: {
    data?: Array<{ label: string; value: string }>;
    label?: string;
    size?: string;
    value?: string;
    readOnly?: boolean;
    onChange?: (e: unknown, option: unknown) => void;
    leftSection?: React.ReactNode;
    renderOption?: (params: { option: { label: string; value: string } }) => React.ReactNode;
  }) => (
    <div data-testid="default-select" data-readonly={props.readOnly}>
      <span data-testid="select-label">{props.label}</span>
      <span data-testid="select-value">{props.value}</span>
      <span data-testid="select-size">{props.size}</span>
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
      {props.renderOption && props.data?.[0] && (
        <div data-testid="rendered-option">
          {props.renderOption({ option: props.data[0] })}
        </div>
      )}
    </div>
  ),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock services
const mockCountSlackChannelMembers = jest.fn();
jest.mock('services/graphServices/slack', () => ({
  countSlackChannelMembers: (...args: unknown[]) => mockCountSlackChannelMembers(...args),
}));

// Mock logger
jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

// Mock MAX_CAPACITY constant
jest.mock('constants/urls', () => ({
  MAX_CAPACITY_FOR_PRIVATE_SHARING: 50,
}));

import SharingModeSelect from '../components/ShareInSlackForm/SharingModeSelect';
import { SharingMode } from '../constants';

const mockStore = configureMockStore([]);

describe('SharingModeSelect', () => {
  const createChannel = (overrides = {}) => ({
    id: 'channel-1',
    name: 'Channel 1',
    isPrivate: false,
    totalMembers: 10,
    isChannel: true,
    ...overrides,
  });

  const createRecipient = () => ({
    id: 'recipient-1',
    name: 'Recipient 1',
    isChannel: false,
  });

  const createStoreState = (overrides = {}) => ({
    shareInSlack: {
      sharingMode: SharingMode.INVITED,
      selectedDestination: createChannel(),
      selectedTeam: { id: 'team-1', name: 'Team 1' },
      ...overrides,
    },
  });

  const renderComponent = (storeState = {}) => {
    const store = mockStore(createStoreState(storeState));
    return { store, ...render(
      <Provider store={store}>
        <SharingModeSelect />
      </Provider>
    )};
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCountSlackChannelMembers.mockResolvedValue(10);
  });

  describe('Rendering', () => {
    it('should render DefaultSelect', () => {
      renderComponent();
      expect(screen.getByTestId('default-select')).toBeInTheDocument();
    });

    it('should display correct label', () => {
      renderComponent();
      expect(screen.getByTestId('select-label')).toHaveTextContent('shareInSlack.sharingMode');
    });

    it('should have lg size', () => {
      renderComponent();
      expect(screen.getByTestId('select-size')).toHaveTextContent('lg');
    });
  });

  describe('Options', () => {
    it('should render INVITED option', () => {
      renderComponent();
      expect(screen.getByTestId('option-INVITED')).toBeInTheDocument();
    });

    it('should render ANYONE option', () => {
      renderComponent();
      expect(screen.getByTestId('option-ANYONE')).toBeInTheDocument();
    });
  });

  describe('Option Selection', () => {
    it('should dispatch setSharingMode when ANYONE is selected', () => {
      const { store } = renderComponent();
      
      fireEvent.click(screen.getByTestId('option-ANYONE'));
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSharingMode',
        payload: SharingMode.ANYONE,
      });
    });

    it('should dispatch setSharingMode when INVITED is selected', () => {
      const { store } = renderComponent({ sharingMode: SharingMode.ANYONE });
      
      fireEvent.click(screen.getByTestId('option-INVITED'));
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSharingMode',
        payload: SharingMode.INVITED,
      });
    });
  });

  describe('Redux State', () => {
    it('should display ANYONE sharing mode', () => {
      renderComponent({ sharingMode: SharingMode.ANYONE });
      expect(screen.getByTestId('select-value')).toHaveTextContent('ANYONE');
    });

    it('should display INVITED sharing mode', () => {
      renderComponent({ sharingMode: SharingMode.INVITED });
      expect(screen.getByTestId('select-value')).toHaveTextContent('INVITED');
    });
  });

  describe('ReadOnly State', () => {
    it('should be readonly when no destination selected', () => {
      renderComponent({ selectedDestination: null });
      expect(screen.getByTestId('default-select')).toHaveAttribute('data-readonly', 'true');
    });

    it('should not be readonly when channel destination is selected with small member count', () => {
      renderComponent({ selectedDestination: createChannel({ totalMembers: 10 }) });
      expect(screen.getByTestId('default-select')).toHaveAttribute('data-readonly', 'false');
    });
  });

  describe('Destination Type Handling', () => {
    it('should set INVITED mode when destination is a direct message (not channel)', () => {
      const { store } = renderComponent({ selectedDestination: createRecipient() });
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSharingMode',
        payload: SharingMode.INVITED,
      });
    });

    it('should set INVITED mode when channel has totalMembers below limit', () => {
      const { store } = renderComponent({ 
        selectedDestination: createChannel({ totalMembers: 30 }) 
      });
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSharingMode',
        payload: SharingMode.INVITED,
      });
    });

    it('should set ANYONE mode when channel has totalMembers above limit', () => {
      const { store } = renderComponent({ 
        selectedDestination: createChannel({ totalMembers: 100 }) 
      });
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSharingMode',
        payload: SharingMode.ANYONE,
      });
    });
  });

  describe('Fetching Channel Members', () => {
    it('should call countSlackChannelMembers when channel has no totalMembers', async () => {
      mockCountSlackChannelMembers.mockResolvedValue(10);
      
      renderComponent({ 
        selectedDestination: createChannel({ totalMembers: undefined }),
        selectedTeam: { id: 'team-123', name: 'Team' },
      });
      
      await waitFor(() => {
        expect(mockCountSlackChannelMembers).toHaveBeenCalledWith('team-123', 'channel-1');
      });
    });

    it('should set ANYONE mode and readonly when fetched members exceed limit', async () => {
      mockCountSlackChannelMembers.mockResolvedValue(100);
      
      const { store } = renderComponent({ 
        selectedDestination: createChannel({ totalMembers: undefined }),
      });
      
      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toContainEqual({
          type: 'SHARE_IN_SLACK/setSharingMode',
          payload: SharingMode.ANYONE,
        });
      });
    });

    it('should set INVITED mode when fetched members are below limit', async () => {
      mockCountSlackChannelMembers.mockResolvedValue(10);
      
      const { store } = renderComponent({ 
        selectedDestination: createChannel({ totalMembers: undefined }),
      });
      
      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toContainEqual({
          type: 'SHARE_IN_SLACK/setSharingMode',
          payload: SharingMode.INVITED,
        });
      });
    });

    it('should dispatch setTotalMembers when fetching succeeds', async () => {
      mockCountSlackChannelMembers.mockResolvedValue(25);
      
      const { store } = renderComponent({ 
        selectedDestination: createChannel({ totalMembers: undefined }),
      });
      
      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toContainEqual({
          type: 'SHARE_IN_SLACK/setTotalMembers',
          payload: 25,
        });
      });
    });

    it('should set ANYONE mode and log error when fetching fails', async () => {
      const error = new Error('Network error');
      mockCountSlackChannelMembers.mockRejectedValue(error);
      const logger = require('helpers/logger').default;
      
      const { store } = renderComponent({ 
        selectedDestination: createChannel({ totalMembers: undefined }),
      });
      
      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toContainEqual({
          type: 'SHARE_IN_SLACK/setSharingMode',
          payload: SharingMode.ANYONE,
        });
        expect(logger.logError).toHaveBeenCalled();
      });
    });
  });

  describe('Left Section', () => {
    it('should render left section with private icon when INVITED mode', () => {
      renderComponent({ sharingMode: SharingMode.INVITED });
      const leftSection = screen.getByTestId('left-section');
      expect(leftSection.querySelector('[data-testid="icon-shared-private-md"]')).toBeInTheDocument();
    });

    it('should render left section with world icon when ANYONE mode', () => {
      renderComponent({ sharingMode: SharingMode.ANYONE });
      const leftSection = screen.getByTestId('left-section');
      expect(leftSection.querySelector('[data-testid="icon-world-md"]')).toBeInTheDocument();
    });
  });

  describe('renderOption', () => {
    it('should render option content', () => {
      renderComponent();
      expect(screen.getByTestId('rendered-option')).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Avatar: (props: { src?: string; size?: string; name?: string; variant?: string }) => (
    <span data-testid="avatar" data-src={props.src} data-name={props.name}>avatar</span>
  ),
  Icomoon: (props: { type?: string; size?: string }) => (
    <span data-testid={`icon-${props.type}`}>icon</span>
  ),
  Text: (props: { children?: React.ReactNode; ellipsis?: boolean }) => (
    <span data-testid="text">{props.children}</span>
  ),
}));

// Mock DefaultSelect with onChange and renderOption
jest.mock('luminComponents/DefaultSelect', () => ({
  __esModule: true,
  default: (props: {
    data?: Array<{ label: string; value: string; data?: unknown }>;
    label?: string;
    size?: string;
    value?: string;
    onChange?: (e: unknown, option: unknown) => void;
    leftSection?: React.ReactNode;
    nothingFoundMessage?: string;
    renderOption?: (params: { option: { label: string; value: string; data?: unknown } }) => React.ReactNode;
  }) => (
    <div data-testid="default-select">
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
      {/* Render options to test renderOption branches */}
      {props.renderOption && props.data && (
        <div data-testid="rendered-options">
          {props.data.map((option, i) => (
            <div key={i} data-testid={`rendered-option-${option.value}`}>
              {props.renderOption({ option })}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock useAuthorize
const mockHandleAuthorize = jest.fn();
jest.mock('../hooks/useAuthorize', () => ({
  useAuthorize: () => ({
    handleAuthorize: mockHandleAuthorize,
    isLoading: false,
  }),
}));

// Mock services
const mockGetSlackChannels = jest.fn();
const mockGetSlackRecipients = jest.fn();
jest.mock('services/graphServices/slack', () => ({
  getSlackChannels: (...args: unknown[]) => mockGetSlackChannels(...args),
  getSlackRecipients: (...args: unknown[]) => mockGetSlackRecipients(...args),
}));

// Mock logger
jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

import WorkspaceSelect from '../components/ShareInSlackForm/WorkspaceSelect';

const mockStore = configureMockStore([]);

describe('WorkspaceSelect', () => {
  const createTeam = (id = 'team-1', overrides = {}) => ({
    id,
    name: `Team ${id}`,
    domain: `team-${id}.slack.com`,
    avatar: `https://example.com/avatar-${id}.png`,
    ...overrides,
  });

  const createStoreState = (overrides = {}) => ({
    shareInSlack: {
      teams: [createTeam('1'), createTeam('2')],
      selectedTeam: createTeam('1'),
      channels: [],
      recipients: [],
      ...overrides,
    },
  });

  const renderComponent = (storeState = {}) => {
    const store = mockStore(createStoreState(storeState));
    return { store, ...render(
      <Provider store={store}>
        <WorkspaceSelect />
      </Provider>
    )};
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSlackChannels.mockResolvedValue([]);
    mockGetSlackRecipients.mockResolvedValue([]);
    mockHandleAuthorize.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render DefaultSelect', () => {
      renderComponent();
      expect(screen.getByTestId('default-select')).toBeInTheDocument();
    });

    it('should display correct label', () => {
      renderComponent();
      expect(screen.getByTestId('select-label')).toHaveTextContent('shareInSlack.selectSlackWorkspace');
    });

    it('should have lg size', () => {
      renderComponent();
      expect(screen.getByTestId('select-size')).toHaveTextContent('lg');
    });
  });

  describe('Teams Options', () => {
    it('should render team options', () => {
      renderComponent();
      expect(screen.getByTestId('option-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-2')).toBeInTheDocument();
    });

    it('should render add another workspace option', () => {
      renderComponent();
      expect(screen.getByTestId('option-add-another-workspace')).toBeInTheDocument();
    });

    it('should display add another workspace label', () => {
      renderComponent();
      expect(screen.getByTestId('option-add-another-workspace')).toHaveTextContent('shareInSlack.addAnotherSlackWorkspace');
    });
  });

  describe('Option Selection', () => {
    it('should dispatch setSelectedTeam when a team is selected', () => {
      const { store } = renderComponent();
      
      fireEvent.click(screen.getByTestId('option-2'));
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSelectedTeam',
        payload: expect.objectContaining({ id: '2' }),
      });
    });

    it('should call handleAuthorize when add-another-workspace is selected', async () => {
      renderComponent();
      
      fireEvent.click(screen.getByTestId('option-add-another-workspace'));
      
      await waitFor(() => {
        expect(mockHandleAuthorize).toHaveBeenCalledTimes(1);
      });
    });

    it('should NOT dispatch setSelectedTeam when add-another-workspace is selected', async () => {
      const { store } = renderComponent();
      store.clearActions();
      
      fireEvent.click(screen.getByTestId('option-add-another-workspace'));
      
      await waitFor(() => {
        const actions = store.getActions();
        const setTeamActions = actions.filter(
          (a: { type: string }) => a.type === 'SHARE_IN_SLACK/setSelectedTeam'
        );
        // Should only have initial mount action, not from clicking add-another-workspace
        expect(setTeamActions.length).toBe(0);
      });
    });
  });

  describe('Selected Team', () => {
    it('should display selected team id as value', () => {
      renderComponent({ selectedTeam: createTeam('1') });
      expect(screen.getByTestId('select-value')).toHaveTextContent('1');
    });

    it('should display different team id when different team is selected', () => {
      renderComponent({ selectedTeam: createTeam('2') });
      expect(screen.getByTestId('select-value')).toHaveTextContent('2');
    });
  });

  describe('Left Section', () => {
    it('should render avatar in left section', () => {
      renderComponent();
      const leftSection = screen.getByTestId('left-section');
      expect(leftSection.querySelector('[data-testid="avatar"]')).toBeInTheDocument();
    });

    it('should display team avatar src', () => {
      renderComponent({ selectedTeam: createTeam('1', { avatar: 'http://test.com/avatar.png' }) });
      const avatar = screen.getByTestId('left-section').querySelector('[data-testid="avatar"]');
      expect(avatar).toHaveAttribute('data-src', 'http://test.com/avatar.png');
    });

    it('should display team name on avatar', () => {
      renderComponent({ selectedTeam: createTeam('1', { name: 'My Team' }) });
      const avatar = screen.getByTestId('left-section').querySelector('[data-testid="avatar"]');
      expect(avatar).toHaveAttribute('data-name', 'My Team');
    });
  });

  describe('Fetching Channels and Recipients', () => {
    it('should fetch channels when selectedTeam changes', async () => {
      renderComponent({ selectedTeam: createTeam('1') });
      
      await waitFor(() => {
        expect(mockGetSlackChannels).toHaveBeenCalledWith('1');
      });
    });

    it('should fetch recipients when selectedTeam changes', async () => {
      renderComponent({ selectedTeam: createTeam('1') });
      
      await waitFor(() => {
        expect(mockGetSlackRecipients).toHaveBeenCalledWith('1');
      });
    });

    it('should dispatch setChannels with fetched data', async () => {
      const channels = [{ id: 'ch-1', name: 'Channel 1' }];
      mockGetSlackChannels.mockResolvedValue(channels);
      
      const { store } = renderComponent({ selectedTeam: createTeam('1') });
      
      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toContainEqual({
          type: 'SHARE_IN_SLACK/setChannels',
          payload: channels,
        });
      });
    });

    it('should dispatch setRecipients with fetched data', async () => {
      const recipients = [{ id: 'rec-1', name: 'User 1' }];
      mockGetSlackRecipients.mockResolvedValue(recipients);
      
      const { store } = renderComponent({ selectedTeam: createTeam('1') });
      
      await waitFor(() => {
        const actions = store.getActions();
        expect(actions).toContainEqual({
          type: 'SHARE_IN_SLACK/setRecipients',
          payload: recipients,
        });
      });
    });

    it('should clear channels and recipients before fetching', async () => {
      const { store } = renderComponent({ selectedTeam: createTeam('1') });
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setChannels',
        payload: [],
      });
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setRecipients',
        payload: [],
      });
    });

    it('should log error when fetching fails', async () => {
      const error = new Error('Network error');
      mockGetSlackChannels.mockRejectedValue(error);
      const logger = require('helpers/logger').default;
      
      renderComponent({ selectedTeam: createTeam('1') });
      
      await waitFor(() => {
        expect(logger.logError).toHaveBeenCalled();
      });
    });

    it('should not fetch when selectedTeam is null', () => {
      renderComponent({ selectedTeam: null });
      
      expect(mockGetSlackChannels).not.toHaveBeenCalled();
      expect(mockGetSlackRecipients).not.toHaveBeenCalled();
    });
  });

  describe('Redux Actions', () => {
    it('should dispatch setSelectedTeam on mount with first team', () => {
      const teams = [createTeam('first'), createTeam('second')];
      const { store } = renderComponent({ teams, selectedTeam: null });
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSelectedTeam',
        payload: teams[0],
      });
    });
  });

  describe('renderOption', () => {
    it('should render team option with avatar', () => {
      renderComponent();
      expect(screen.getByTestId('rendered-option-1')).toBeInTheDocument();
    });

    it('should render add workspace option with plus icon', () => {
      renderComponent();
      expect(screen.getByTestId('rendered-option-add-another-workspace')).toBeInTheDocument();
      expect(screen.getByTestId('icon-plus-md')).toBeInTheDocument();
    });

    it('should show check icon for selected team', () => {
      renderComponent({ selectedTeam: createTeam('1') });
      // The rendered option for team 1 should contain check icon
      const renderedOption = screen.getByTestId('rendered-option-1');
      expect(renderedOption.querySelector('[data-testid="icon-check-sm"]')).toBeInTheDocument();
    });
  });
});

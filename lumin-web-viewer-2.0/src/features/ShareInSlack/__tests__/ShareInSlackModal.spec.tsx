import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

// Mock lumin-ui components - must use require inside factory to avoid out-of-scope reference
jest.mock('lumin-ui/kiwi-ui', () => ({
  Paper: (props: { children: React.ReactNode; className?: string }) => {
    const { children, className } = props;
    return <div data-testid="paper" className={className}>{children}</div>;
  },
  Text: (props: { children: React.ReactNode; type?: string; size?: string }) => {
    const { children, type, size } = props;
    return <span data-testid="text" data-type={type} data-size={size}>{children}</span>;
  },
}));

jest.mock('luminComponents/Loading', () => ({
  __esModule: true,
  default: (props: { normal?: boolean }) => (
    <div data-testid="loading" data-normal={props.normal}>Loading...</div>
  ),
}));

jest.mock('luminComponents/ShareModal/components/Title', () => ({
  __esModule: true,
  default: (props: { onBack: () => void; showBackButton: boolean; titleElement: React.ReactNode }) => (
    <div data-testid="title">
      {props.showBackButton && <button data-testid="back-button" onClick={props.onBack}>Back</button>}
      {props.titleElement}
    </div>
  ),
}));

// Mock the lazy-loaded components directly
const MockSignInWithSlack = () => <div data-testid="sign-in-with-slack">SignInWithSlack</div>;
const MockShareInSlackForm = () => <div data-testid="share-in-slack-form">ShareInSlackForm</div>;

jest.mock('../components/SignInWithSlack', () => ({
  __esModule: true,
  default: MockSignInWithSlack,
}));

jest.mock('../components/ShareInSlackForm', () => ({
  __esModule: true,
  default: MockShareInSlackForm,
}));

// Mock lazyWithRetry to return the component directly (already mocked above)
jest.mock('utils/lazyWithRetry', () => ({
  lazyWithRetry: (importFn: () => Promise<{ default: unknown }>) => {
    // Synchronously return a wrapper that will use the already-mocked components
    const MockComponent = (props: Record<string, unknown>) => {
      const [Comp, setComp] = require('react').useState<React.ComponentType | null>(null);
      
      require('react').useEffect(() => {
        importFn().then((mod: { default: React.ComponentType }) => {
          setComp(() => mod.default);
        });
      }, []);
      
      if (!Comp) return null;
      return <Comp {...props} />;
    };
    return MockComponent;
  },
}));

// Mock services
const mockGetSlackTeams = jest.fn();
jest.mock('services/graphServices/slack', () => ({
  getSlackTeams: () => mockGetSlackTeams(),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock logger
jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logInfo: jest.fn(),
    logError: jest.fn(),
  },
}));

// Mock assets
jest.mock('assets/reskin/lumin-svgs/slack-logo.svg', () => 'slack-logo.svg');

// Import after mocks
import ShareInSlackModal from '../ShareInSlackModal';

const mockStore = configureMockStore([]);

// ============ HELPERS ============
const createTeam = (id = 'team-1') => ({
  id,
  name: `Team ${id}`,
  domain: `team-${id}.slack.com`,
  avatar: `https://example.com/avatar-${id}.png`,
});

const createStoreState = (teams: Array<{ id: string; name: string }> = []) => ({
  shareInSlack: {
    teams,
    channels: [],
    recipients: [],
    selectedTeam: null,
    selectedDestination: null,
    sharingMode: null,
    accessLevel: null,
    isSharingQueueProcessing: false,
    sharedDocumentInfo: null,
    isSharing: false,
  },
});

describe('ShareInSlackModal', () => {
  let reduxStore: ReturnType<typeof mockStore>;
  let mockOnClose: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnClose = jest.fn();
    mockGetSlackTeams.mockResolvedValue([]);
    reduxStore = mockStore(createStoreState());
  });

  const renderModal = (onClose = mockOnClose) => {
    return render(
      <Provider store={reduxStore}>
        <ShareInSlackModal onClose={onClose} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render modal container', async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByTestId('paper')).toBeInTheDocument();
      });
    });

    it('should render title with back button', async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByTestId('title')).toBeInTheDocument();
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
      });
    });

    it('should render slack logo in title', async () => {
      renderModal();

      await waitFor(() => {
        const img = screen.getByAltText('share-in-slack');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'slack-logo.svg');
      });
    });

    it('should call onClose when back button is clicked', async () => {
      renderModal();

      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
      });

      screen.getByTestId('back-button').click();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while fetching teams', async () => {
      mockGetSlackTeams.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderModal();

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
      });
    });
  });

  describe('Content Rendering', () => {
    it('should show SignInWithSlack when no teams are available', async () => {
      mockGetSlackTeams.mockResolvedValue([]);
      reduxStore = mockStore(createStoreState([]));

      renderModal();

      await waitFor(() => {
        expect(screen.getByTestId('sign-in-with-slack')).toBeInTheDocument();
      });
    });

    it('should show ShareInSlackForm when teams are available', async () => {
      const teams = [createTeam('1'), createTeam('2')];
      mockGetSlackTeams.mockResolvedValue(teams);
      reduxStore = mockStore(createStoreState(teams));

      renderModal();

      await waitFor(() => {
        expect(screen.getByTestId('share-in-slack-form')).toBeInTheDocument();
      });
    });
  });

  describe('Teams Fetching', () => {
    it('should fetch teams on mount', async () => {
      renderModal();

      await waitFor(() => {
        expect(mockGetSlackTeams).toHaveBeenCalledTimes(1);
      });
    });

    it('should dispatch setTeams when teams are fetched', async () => {
      const teams = [createTeam('1')];
      mockGetSlackTeams.mockResolvedValue(teams);

      renderModal();

      await waitFor(() => {
        const actions = reduxStore.getActions();
        expect(actions).toContainEqual({
          type: 'SHARE_IN_SLACK/setTeams',
          payload: teams,
        });
      });
    });

    it('should not dispatch setTeams when teams array is empty', async () => {
      mockGetSlackTeams.mockResolvedValue([]);

      renderModal();

      await waitFor(() => {
        const actions = reduxStore.getActions();
        const setTeamsActions = actions.filter((a: { type: string }) => a.type === 'SHARE_IN_SLACK/setTeams');
        expect(setTeamsActions).toHaveLength(0);
      });
    });

    it('should handle error when fetching teams fails', async () => {
      const error = new Error('Network error');
      mockGetSlackTeams.mockRejectedValue(error);
      const logger = require('helpers/logger').default;

      renderModal();

      await waitFor(() => {
        expect(logger.logInfo).toHaveBeenCalled();
      });
    });
  });

  describe('Cleanup', () => {
    it('should dispatch resetForm and resetSlackStates on unmount', async () => {
      const { unmount } = renderModal();

      await waitFor(() => {
        expect(screen.getByTestId('paper')).toBeInTheDocument();
      });

      act(() => {
        unmount();
      });

      const actions = reduxStore.getActions();
      expect(actions).toContainEqual({ type: 'SHARE_IN_SLACK/resetForm' });
      expect(actions).toContainEqual({ type: 'SHARE_IN_SLACK/resetSlackStates' });
    });
  });

  describe('Default Props', () => {
    it('should work with default onClose prop', async () => {
      render(
        <Provider store={reduxStore}>
          <ShareInSlackModal />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('paper')).toBeInTheDocument();
      });

      // Should not throw when back button is clicked with default onClose
      screen.getByTestId('back-button').click();
    });
  });
});

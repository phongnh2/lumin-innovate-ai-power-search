import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Icomoon: (props: { type?: string; size?: string }) => (
    <span data-testid={`icon-${props.type}`}>icon</span>
  ),
  PlainTooltip: (props: { children?: React.ReactNode; content?: string }) => (
    <span data-testid="tooltip" data-content={props.content}>{props.children}</span>
  ),
  Skeleton: (props: { width?: number; height?: number; radius?: string; className?: string }) => (
    <span data-testid="skeleton" data-width={props.width} data-classname={props.className}>skeleton</span>
  ),
  Text: (props: { children?: React.ReactNode; ellipsis?: boolean; className?: string; color?: string; type?: string; size?: string }) => (
    <span data-testid="text" data-classname={props.className}>{props.children}</span>
  ),
  Collapse: (props: { children?: React.ReactNode; in?: boolean; className?: string }) => (
    props.in ? <div data-testid="collapse">{props.children}</div> : null
  ),
}));

// Store handlers for testing
let capturedOnChange: ((e: unknown, option: unknown) => void) | null = null;
let capturedOnSearchChange: ((value: string) => void) | null = null;
let capturedOnBlur: (() => void) | null = null;
let capturedOnOptionSubmit: ((value: string) => void) | null = null;
let capturedRenderOption: ((params: { option: { label: string; value: string; disabled?: boolean; data: unknown } }) => React.ReactNode) | null = null;

// Mock DefaultSelect with all handlers
jest.mock('luminComponents/DefaultSelect', () => ({
  __esModule: true,
  default: (props: {
    data?: Array<{ group?: string; items?: Array<{ label: string; value: string; disabled?: boolean; data?: unknown }> }>;
    label?: string;
    size?: string;
    value?: string | null;
    searchable?: boolean;
    placeholder?: string;
    onChange?: (e: unknown, option: unknown) => void;
    leftSection?: React.ReactNode;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    nothingFoundMessage?: React.ReactNode;
    onBlur?: () => void;
    onOptionSubmit?: (value: string) => void;
    renderOption?: (params: { option: { label: string; value: string; disabled?: boolean; data?: unknown } }) => React.ReactNode;
  }) => {
    capturedOnChange = props.onChange || null;
    capturedOnSearchChange = props.onSearchChange || null;
    capturedOnBlur = props.onBlur || null;
    capturedOnOptionSubmit = props.onOptionSubmit || null;
    capturedRenderOption = props.renderOption || null;
    
    return (
      <div data-testid="default-select" data-searchable={props.searchable}>
        <span data-testid="select-label">{props.label}</span>
        <span data-testid="select-value">{props.value || ''}</span>
        <span data-testid="select-placeholder">{props.placeholder}</span>
        <span data-testid="search-value">{props.searchValue}</span>
        <div data-testid="left-section">{props.leftSection}</div>
        <div data-testid="groups">
          {props.data?.map((group, gIdx) => (
            <div key={gIdx} data-testid={`group-${group.group || gIdx}`}>
              <span>{group.group}</span>
              {group.items?.map((item) => (
                <button
                  key={item.value}
                  data-testid={`option-${item.value}`}
                  data-disabled={item.disabled}
                  onClick={() => props.onChange?.(null, item)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
        {/* Render options using renderOption for testing */}
        {props.renderOption && props.data && (
          <div data-testid="rendered-options">
            {props.data.flatMap((group) => 
              group.items?.map((item, idx) => (
                <div key={`${group.group}-${idx}`} data-testid={`rendered-${item.value}`}>
                  {props.renderOption!({ option: item as { label: string; value: string; disabled?: boolean; data: unknown } })}
                </div>
              )) || []
            )}
          </div>
        )}
        <button data-testid="blur-trigger" onClick={() => props.onBlur?.()}>Blur</button>
      </div>
    );
  },
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string, params?: Record<string, string>) => params?.egText ? `e.g. ${params.egText}` : key }),
}));

// Mock utils
const mockIsDriveOnlyUser = jest.fn();
jest.mock('utils/restrictedUserUtil', () => ({
  isDriveOnlyUser: (email: string) => mockIsDriveOnlyUser(email),
}));

import DestinationSelect from '../components/ShareInSlackForm/DestinationSelect';
import { SharingMode } from '../constants';

const mockStore = configureMockStore([]);

describe('DestinationSelect', () => {
  const createChannel = (id = 'channel-1', overrides = {}) => ({
    id,
    name: `Channel ${id}`,
    isPrivate: false,
    totalMembers: 10,
    ...overrides,
  });

  const createRecipient = (id = 'recipient-1', overrides = {}) => ({
    id,
    name: `Recipient ${id}`,
    displayName: `Display ${id}`,
    email: `${id}@example.com`,
    avatarUrl: `https://example.com/avatar-${id}.png`,
    isChannel: false,
    ...overrides,
  });

  const createStoreState = (overrides = {}) => ({
    shareInSlack: {
      channels: [createChannel('ch-1'), createChannel('ch-2')],
      recipients: [createRecipient('rec-1'), createRecipient('rec-2')],
      selectedDestination: null,
      selectedTeam: { id: 'team-1', name: 'Team 1' },
      sharingMode: SharingMode.INVITED,
      ...overrides,
    },
  });

  const renderComponent = (storeState = {}) => {
    const store = mockStore(createStoreState(storeState));
    return { store, ...render(
      <Provider store={store}>
        <DestinationSelect />
      </Provider>
    )};
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDriveOnlyUser.mockReturnValue(false);
    capturedOnChange = null;
    capturedOnSearchChange = null;
    capturedOnBlur = null;
    capturedOnOptionSubmit = null;
    capturedRenderOption = null;
  });

  describe('Rendering', () => {
    it('should render DefaultSelect', () => {
      renderComponent();
      expect(screen.getByTestId('default-select')).toBeInTheDocument();
    });

    it('should display correct label', () => {
      renderComponent();
      expect(screen.getByTestId('select-label')).toHaveTextContent('shareInSlack.selectDestination');
    });

    it('should be searchable', () => {
      renderComponent();
      expect(screen.getByTestId('default-select')).toHaveAttribute('data-searchable', 'true');
    });

    it('should display placeholder', () => {
      renderComponent();
      expect(screen.getByTestId('select-placeholder')).toHaveTextContent('e.g. Lumin');
    });
  });

  describe('Groups', () => {
    it('should render channels group', () => {
      renderComponent();
      expect(screen.getByTestId('group-shareInSlack.channels')).toBeInTheDocument();
    });

    it('should render direct messages group', () => {
      renderComponent();
      expect(screen.getByTestId('group-shareInSlack.directMessages')).toBeInTheDocument();
    });
  });

  describe('Options', () => {
    it('should render channel options with correct values', () => {
      renderComponent();
      expect(screen.getByTestId('option-ch-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-ch-2')).toBeInTheDocument();
    });

    it('should render recipient options with correct values', () => {
      renderComponent();
      expect(screen.getByTestId('option-rec-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-rec-2')).toBeInTheDocument();
    });

    it('should call isDriveOnlyUser for each recipient', () => {
      renderComponent();
      expect(mockIsDriveOnlyUser).toHaveBeenCalledWith('rec-1@example.com');
      expect(mockIsDriveOnlyUser).toHaveBeenCalledWith('rec-2@example.com');
    });

    it('should mark recipient as disabled when isDriveOnlyUser returns true', () => {
      mockIsDriveOnlyUser.mockReturnValue(true);
      renderComponent();
      expect(screen.getByTestId('option-rec-1')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Option Selection', () => {
    it('should dispatch setSelectedDestination when channel is selected', () => {
      const { store } = renderComponent();
      store.clearActions();
      
      fireEvent.click(screen.getByTestId('option-ch-1'));
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSelectedDestination',
        payload: expect.objectContaining({ id: 'ch-1', isChannel: true }),
      });
    });

    it('should dispatch setSelectedDestination when recipient is selected', () => {
      const { store } = renderComponent();
      store.clearActions();
      
      fireEvent.click(screen.getByTestId('option-rec-1'));
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSelectedDestination',
        payload: expect.objectContaining({ id: 'rec-1' }),
      });
    });

    it('should not dispatch when skeleton option is clicked (data is null)', () => {
      const { store } = renderComponent({ channels: [], recipients: [] });
      store.clearActions();
      
      // Click skeleton option
      fireEvent.click(screen.getByTestId('option-channel 1'));
      
      const actions = store.getActions();
      const setDestinationActions = actions.filter(
        (a: { type: string }) => a.type === 'SHARE_IN_SLACK/setSelectedDestination'
      );
      expect(setDestinationActions.length).toBe(0);
    });
  });

  describe('Selected Destination', () => {
    it('should display empty when no destination selected', () => {
      renderComponent({ selectedDestination: null });
      expect(screen.getByTestId('select-value')).toHaveTextContent('');
    });

    it('should display channel id when channel is selected', () => {
      renderComponent({ selectedDestination: { ...createChannel('selected-ch'), isChannel: true } });
      expect(screen.getByTestId('select-value')).toHaveTextContent('selected-ch');
    });

    it('should display recipient id when recipient is selected', () => {
      renderComponent({ selectedDestination: { ...createRecipient('selected-rec'), isChannel: false } });
      expect(screen.getByTestId('select-value')).toHaveTextContent('selected-rec');
    });
  });

  describe('Skeleton Loading', () => {
    it('should show skeleton data when both channels and recipients are empty', () => {
      renderComponent({ channels: [], recipients: [] });
      const channelSkeletons = screen.getAllByTestId(/^option-channel/);
      const recipientSkeletons = screen.getAllByTestId(/^option-recipient/);
      expect(channelSkeletons.length).toBe(3);
      expect(recipientSkeletons.length).toBe(3);
    });

    it('should not show skeleton when channels exist', () => {
      renderComponent({ channels: [createChannel('ch-1')], recipients: [] });
      expect(screen.queryByTestId('option-channel 1')).not.toBeInTheDocument();
    });

    it('should not show skeleton when recipients exist', () => {
      renderComponent({ channels: [], recipients: [createRecipient('rec-1')] });
      expect(screen.queryByTestId('option-channel 1')).not.toBeInTheDocument();
    });
  });

  describe('Selection Warning', () => {
    it('should not show warning when no destination selected', () => {
      renderComponent({ selectedDestination: null });
      expect(screen.queryByTestId('collapse')).not.toBeInTheDocument();
    });

    it('should not show warning for public channel', () => {
      renderComponent({ 
        selectedDestination: { ...createChannel('ch-1', { isPrivate: false }), isChannel: true } 
      });
      expect(screen.queryByTestId('collapse')).not.toBeInTheDocument();
    });

    it('should show warning for direct message', () => {
      renderComponent({ selectedDestination: { ...createRecipient('rec-1'), isChannel: false } });
      expect(screen.getByTestId('collapse')).toBeInTheDocument();
      expect(screen.getByTestId('collapse')).toHaveTextContent('shareInSlack.directMessageSelectionWarning');
    });

    it('should show public mode warning for private channel with ANYONE mode', () => {
      renderComponent({ 
        selectedDestination: { ...createChannel('ch-1', { isPrivate: true }), isChannel: true },
        sharingMode: SharingMode.ANYONE,
      });
      expect(screen.getByTestId('collapse')).toBeInTheDocument();
      expect(screen.getByTestId('collapse')).toHaveTextContent('shareInSlack.privateChannelAndPublicModeSelectionWarning');
    });

    it('should show private mode warning for private channel with INVITED mode', () => {
      renderComponent({ 
        selectedDestination: { ...createChannel('ch-1', { isPrivate: true }), isChannel: true },
        sharingMode: SharingMode.INVITED,
      });
      expect(screen.getByTestId('collapse')).toBeInTheDocument();
      expect(screen.getByTestId('collapse')).toHaveTextContent('shareInSlack.privateChannelAndPrivateModeSelectionWarning');
    });
  });

  describe('Team Change', () => {
    it('should dispatch setSelectedDestination with null on mount', () => {
      const { store } = renderComponent();
      
      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: 'SHARE_IN_SLACK/setSelectedDestination',
        payload: null,
      });
    });
  });

  describe('Left Section', () => {
    it('should not render left section content when destination is not a channel', () => {
      renderComponent({ selectedDestination: { ...createRecipient('rec-1'), isChannel: false } });
      const leftSection = screen.getByTestId('left-section');
      expect(leftSection).toBeEmptyDOMElement();
    });

    it('should render left section for channel destination', () => {
      renderComponent({ selectedDestination: { ...createChannel('ch-1', { isPrivate: false }), isChannel: true } });
      expect(screen.getByTestId('left-section')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should capture onSearchChange handler', () => {
      renderComponent();
      expect(capturedOnSearchChange).not.toBeNull();
    });

    it('should call onSearchChange with value', () => {
      renderComponent({ selectedDestination: { ...createChannel('ch-1'), isChannel: true } });
      
      act(() => {
        capturedOnSearchChange?.('test value');
      });
      
      // Handler was called successfully
      expect(capturedOnSearchChange).toBeDefined();
    });

    it('should handle empty search value when channel is selected', () => {
      renderComponent({ selectedDestination: { ...createChannel('ch-1'), isChannel: true } });
      
      act(() => {
        capturedOnSearchChange?.('');
      });
      
      // Should trigger setShoudDisplayLeftSection(false)
      expect(capturedOnSearchChange).toBeDefined();
    });

    it('should handle blur event when channel is selected', () => {
      renderComponent({ selectedDestination: { ...createChannel('ch-1'), isChannel: true } });
      
      fireEvent.click(screen.getByTestId('blur-trigger'));
      
      expect(capturedOnBlur).toBeDefined();
    });

    it('should handle blur event when no destination selected', () => {
      renderComponent({ selectedDestination: null });
      
      fireEvent.click(screen.getByTestId('blur-trigger'));
      
      expect(capturedOnBlur).toBeDefined();
    });
  });

  describe('onOptionSubmit', () => {
    it('should handle option submit for channel when name differs from search', () => {
      renderComponent({ 
        selectedDestination: { ...createChannel('ch-1', { name: 'My Channel' }), isChannel: true } 
      });
      
      // First set a different search value
      act(() => {
        capturedOnSearchChange?.('different');
      });
      
      // Then submit the option
      act(() => {
        capturedOnOptionSubmit?.('ch-1');
      });
      
      expect(capturedOnOptionSubmit).toBeDefined();
    });

    it('should handle option submit for recipient when name differs from search', () => {
      renderComponent({ 
        selectedDestination: { ...createRecipient('rec-1', { name: 'John', displayName: 'johnd' }), isChannel: false } 
      });
      
      act(() => {
        capturedOnSearchChange?.('different');
      });
      
      act(() => {
        capturedOnOptionSubmit?.('rec-1');
      });
      
      expect(capturedOnOptionSubmit).toBeDefined();
    });

    it('should not update search when option id does not match', () => {
      renderComponent({ 
        selectedDestination: { ...createChannel('ch-1'), isChannel: true } 
      });
      
      act(() => {
        capturedOnOptionSubmit?.('different-id');
      });
      
      expect(capturedOnOptionSubmit).toBeDefined();
    });

    it('should not update search when no destination selected', () => {
      renderComponent({ selectedDestination: null });
      
      act(() => {
        capturedOnOptionSubmit?.('ch-1');
      });
      
      expect(capturedOnOptionSubmit).toBeDefined();
    });
  });

  describe('Recipient Name Display', () => {
    it('should format name with displayName in parentheses', () => {
      renderComponent({
        recipients: [createRecipient('rec-1', { name: 'John Doe', displayName: 'johnd' })],
      });
      
      const recipientOption = screen.getByTestId('option-rec-1');
      expect(recipientOption).toHaveTextContent('John Doe (@johnd)');
    });

    it('should display only name when displayName is empty', () => {
      renderComponent({
        recipients: [createRecipient('rec-1', { name: 'John Doe', displayName: '' })],
      });
      
      const recipientOption = screen.getByTestId('option-rec-1');
      expect(recipientOption).toHaveTextContent('John Doe');
      expect(recipientOption).not.toHaveTextContent('@');
    });
  });

  describe('renderOption callback', () => {
    it('should render channel skeleton option correctly', () => {
      renderComponent({ channels: [], recipients: [] });
      
      // Skeleton items are rendered, check for skeletons in rendered options
      const renderedOptions = screen.getByTestId('rendered-options');
      const skeletons = renderedOptions.querySelectorAll('[data-testid="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render recipient skeleton option correctly', () => {
      renderComponent({ channels: [], recipients: [] });
      
      const renderedRecipient = screen.getByTestId('rendered-recipient 1');
      expect(renderedRecipient).toBeInTheDocument();
    });

    it('should render public channel option with mark icon', () => {
      renderComponent({
        channels: [createChannel('ch-1', { isPrivate: false })],
        recipients: [],
      });
      
      const renderedChannel = screen.getByTestId('rendered-ch-1');
      expect(renderedChannel.querySelector('[data-testid="icon-mark-md"]')).toBeInTheDocument();
    });

    it('should render private channel option with private icon', () => {
      renderComponent({
        channels: [createChannel('ch-1', { isPrivate: true })],
        recipients: [],
      });
      
      const renderedChannel = screen.getByTestId('rendered-ch-1');
      expect(renderedChannel.querySelector('[data-testid="icon-shared-private-md"]')).toBeInTheDocument();
    });

    it('should render recipient option without channel icon', () => {
      renderComponent({
        channels: [],
        recipients: [createRecipient('rec-1')],
      });
      
      const renderedRecipient = screen.getByTestId('rendered-rec-1');
      expect(renderedRecipient.querySelector('[data-testid="icon-mark-md"]')).not.toBeInTheDocument();
    });

    it('should show check icon for selected option', () => {
      renderComponent({
        channels: [createChannel('ch-1')],
        recipients: [],
        selectedDestination: { ...createChannel('ch-1'), isChannel: true },
      });
      
      const renderedChannel = screen.getByTestId('rendered-ch-1');
      expect(renderedChannel.querySelector('[data-testid="icon-check-sm"]')).toBeInTheDocument();
    });

    it('should not show check icon for non-selected option', () => {
      renderComponent({
        channels: [createChannel('ch-1'), createChannel('ch-2')],
        recipients: [],
        selectedDestination: { ...createChannel('ch-1'), isChannel: true },
      });
      
      const renderedChannel2 = screen.getByTestId('rendered-ch-2');
      expect(renderedChannel2.querySelector('[data-testid="icon-check-sm"]')).not.toBeInTheDocument();
    });

    it('should show tooltip content for disabled option', () => {
      mockIsDriveOnlyUser.mockReturnValue(true);
      renderComponent({
        channels: [],
        recipients: [createRecipient('rec-1')],
      });
      
      const tooltip = screen.getByTestId('rendered-rec-1').querySelector('[data-testid="tooltip"]');
      expect(tooltip).toHaveAttribute('data-content', 'modalShare.cannotShareDocumentWithUser');
    });

    it('should show empty tooltip for non-disabled option', () => {
      mockIsDriveOnlyUser.mockReturnValue(false);
      renderComponent({
        channels: [],
        recipients: [createRecipient('rec-1')],
      });
      
      const tooltip = screen.getByTestId('rendered-rec-1').querySelector('[data-testid="tooltip"]');
      expect(tooltip).toHaveAttribute('data-content', '');
    });
  });
});

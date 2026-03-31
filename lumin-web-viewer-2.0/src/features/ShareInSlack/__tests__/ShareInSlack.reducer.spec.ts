import reducer, {
  setTeams,
  setChannels,
  setRecipients,
  resetSlackStates,
  setSelectedTeam,
  setSelectedDestination,
  setSharingMode,
  setAccessLevel,
  setTotalMembers,
  setIsSharingQueueProcessing,
  resetForm,
  setSharedDocumentInfo,
  setIsSharing,
  shareInSlackSelectors,
} from '../reducer/ShareInSlack.reducer';
import { SharingMode } from '../constants';
import { SlackChannel, SlackRecipient, SlackTeam, ShareInSlackState } from '../interfaces/slack.interface';

// ============ FACTORIES ============
const createTeam = (id = 'team-1', overrides = {}): SlackTeam => ({
  id,
  name: `Team ${id}`,
  domain: `team-${id}.slack.com`,
  avatar: `https://example.com/avatar-${id}.png`,
  ...overrides,
});

const createChannel = (id = 'channel-1', overrides = {}): SlackChannel => ({
  id,
  name: `Channel ${id}`,
  isPrivate: false,
  totalMembers: 10,
  isChannel: true,
  ...overrides,
});

const createRecipient = (id = 'recipient-1', overrides = {}): SlackRecipient => ({
  id,
  name: `Recipient ${id}`,
  displayName: `Display ${id}`,
  email: `${id}@example.com`,
  avatarUrl: `https://example.com/avatar-${id}.png`,
  isChannel: false,
  ...overrides,
});

const createState = (overrides = {}): ShareInSlackState => ({
  teams: [],
  channels: [],
  recipients: [],
  selectedTeam: null,
  selectedDestination: null,
  sharingMode: null,
  accessLevel: null,
  isSharingQueueProcessing: false,
  sharedDocumentInfo: null,
  isSharing: false,
  ...overrides,
});

const createRootState = (shareInSlackState: Partial<ShareInSlackState> = {}) => ({
  shareInSlack: createState(shareInSlackState),
});

describe('shareInSlackSlice', () => {
  describe('Initial State', () => {
    it('should return the initial state', () => {
      const state = reducer(undefined, { type: 'unknown' });

      expect(state).toEqual(createState());
    });
  });

  describe('Reducers', () => {
    describe('setTeams', () => {
      it('should set teams array', () => {
        const teams = [createTeam('1'), createTeam('2')];
        const state = reducer(createState(), setTeams(teams));

        expect(state.teams).toEqual(teams);
        expect(state.teams).toHaveLength(2);
      });

      it('should replace existing teams', () => {
        const initialState = createState({ teams: [createTeam('old')] });
        const newTeams = [createTeam('new')];
        const state = reducer(initialState, setTeams(newTeams));

        expect(state.teams).toEqual(newTeams);
        expect(state.teams).toHaveLength(1);
      });
    });

    describe('setChannels', () => {
      it('should set channels array', () => {
        const channels = [createChannel('1'), createChannel('2', { isPrivate: true })];
        const state = reducer(createState(), setChannels(channels));

        expect(state.channels).toEqual(channels);
        expect(state.channels).toHaveLength(2);
      });
    });

    describe('setRecipients', () => {
      it('should set recipients array', () => {
        const recipients = [createRecipient('1'), createRecipient('2')];
        const state = reducer(createState(), setRecipients(recipients));

        expect(state.recipients).toEqual(recipients);
        expect(state.recipients).toHaveLength(2);
      });
    });

    describe('resetSlackStates', () => {
      it('should reset teams, channels, and recipients to empty arrays', () => {
        const initialState = createState({
          teams: [createTeam()],
          channels: [createChannel()],
          recipients: [createRecipient()],
          selectedTeam: createTeam(),
        });
        const state = reducer(initialState, resetSlackStates());

        expect(state.teams).toEqual([]);
        expect(state.channels).toEqual([]);
        expect(state.recipients).toEqual([]);
        expect(state.selectedTeam).not.toBeNull(); // Should not reset selectedTeam
      });
    });

    describe('setSelectedTeam', () => {
      it('should set selected team', () => {
        const team = createTeam('selected');
        const state = reducer(createState(), setSelectedTeam(team));

        expect(state.selectedTeam).toEqual(team);
      });

      it('should set selected team to null', () => {
        const initialState = createState({ selectedTeam: createTeam() });
        const state = reducer(initialState, setSelectedTeam(null));

        expect(state.selectedTeam).toBeNull();
      });
    });

    describe('setSelectedDestination', () => {
      it('should set selected destination as channel', () => {
        const channel = createChannel('dest');
        const state = reducer(createState(), setSelectedDestination(channel));

        expect(state.selectedDestination).toEqual(channel);
      });

      it('should set selected destination as recipient', () => {
        const recipient = createRecipient('dest');
        const state = reducer(createState(), setSelectedDestination(recipient));

        expect(state.selectedDestination).toEqual(recipient);
      });

      it('should set selected destination to null', () => {
        const initialState = createState({ selectedDestination: createChannel() });
        const state = reducer(initialState, setSelectedDestination(null));

        expect(state.selectedDestination).toBeNull();
      });
    });

    describe('setSharingMode', () => {
      it.each([
        [SharingMode.ANYONE],
        [SharingMode.INVITED],
        [null],
      ])('should set sharing mode to %s', (mode) => {
        const state = reducer(createState(), setSharingMode(mode));
        expect(state.sharingMode).toBe(mode);
      });
    });

    describe('setAccessLevel', () => {
      it.each([
        ['VIEWER'],
        ['COMMENTER'],
        ['EDITOR'],
        [null],
      ])('should set access level to %s', (level) => {
        const state = reducer(createState(), setAccessLevel(level));
        expect(state.accessLevel).toBe(level);
      });
    });

    describe('setTotalMembers', () => {
      it('should set total members when destination is a channel', () => {
        const channel = createChannel('dest', { totalMembers: 5 });
        const initialState = createState({ selectedDestination: channel });
        const state = reducer(initialState, setTotalMembers(100));

        expect((state.selectedDestination as SlackChannel).totalMembers).toBe(100);
      });

      it('should not change state when destination is not a channel', () => {
        const recipient = createRecipient('dest');
        const initialState = createState({ selectedDestination: recipient });
        const state = reducer(initialState, setTotalMembers(100));

        expect(state.selectedDestination).toEqual(recipient);
      });

      it('should not change state when destination is null', () => {
        const state = reducer(createState(), setTotalMembers(100));
        expect(state.selectedDestination).toBeNull();
      });
    });

    describe('setIsSharingQueueProcessing', () => {
      it.each([[true], [false]])('should set isSharingQueueProcessing to %s', (value) => {
        const state = reducer(createState(), setIsSharingQueueProcessing(value));
        expect(state.isSharingQueueProcessing).toBe(value);
      });
    });

    describe('resetForm', () => {
      it('should reset form fields but keep other state', () => {
        const initialState = createState({
          teams: [createTeam()],
          channels: [createChannel()],
          selectedTeam: createTeam(),
          selectedDestination: createChannel(),
          sharingMode: SharingMode.ANYONE,
          accessLevel: 'EDITOR',
          isSharingQueueProcessing: true,
        });
        const state = reducer(initialState, resetForm());

        expect(state.selectedTeam).toBeNull();
        expect(state.selectedDestination).toBeNull();
        expect(state.sharingMode).toBeNull();
        expect(state.accessLevel).toBeNull();
        // Should preserve these
        expect(state.teams).toHaveLength(1);
        expect(state.channels).toHaveLength(1);
        expect(state.isSharingQueueProcessing).toBe(true);
      });
    });

    describe('setSharedDocumentInfo', () => {
      it('should set shared document info', () => {
        const info = { documentId: 'doc-123' };
        const state = reducer(createState(), setSharedDocumentInfo(info));

        expect(state.sharedDocumentInfo).toEqual(info);
      });

      it('should set shared document info to null', () => {
        const initialState = createState({ sharedDocumentInfo: { documentId: 'doc-123' } });
        const state = reducer(initialState, setSharedDocumentInfo(null));

        expect(state.sharedDocumentInfo).toBeNull();
      });
    });

    describe('setIsSharing', () => {
      it.each([[true], [false]])('should set isSharing to %s', (value) => {
        const state = reducer(createState(), setIsSharing(value));
        expect(state.isSharing).toBe(value);
      });
    });
  });

  describe('Selectors', () => {
    it.each([
      ['getTeams', 'teams', [createTeam()]],
      ['getChannels', 'channels', [createChannel()]],
      ['getRecipients', 'recipients', [createRecipient()]],
      ['getSelectedTeam', 'selectedTeam', createTeam()],
      ['getSelectedDestination', 'selectedDestination', createChannel()],
      ['getSharingMode', 'sharingMode', SharingMode.ANYONE],
      ['getAccessLevel', 'accessLevel', 'EDITOR'],
      ['getIsSharingQueueProcessing', 'isSharingQueueProcessing', true],
      ['getSharedDocumentInfo', 'sharedDocumentInfo', { documentId: 'doc-123' }],
      ['getIsSharing', 'isSharing', true],
    ])('%s should return %s from state', (selectorName, stateKey, expectedValue) => {
      const state = createRootState({ [stateKey]: expectedValue });
      const selector = shareInSlackSelectors[selectorName as keyof typeof shareInSlackSelectors];

      expect(selector(state)).toEqual(expectedValue);
    });

    describe('getFormData', () => {
      it('should return all form data fields', () => {
        const formData = {
          selectedTeam: createTeam(),
          selectedDestination: createChannel(),
          sharingMode: SharingMode.INVITED,
          accessLevel: 'VIEWER',
        };
        const state = createRootState(formData);

        expect(shareInSlackSelectors.getFormData(state)).toEqual(formData);
      });

      it('should return null values for empty form', () => {
        const state = createRootState();

        expect(shareInSlackSelectors.getFormData(state)).toEqual({
          selectedTeam: null,
          selectedDestination: null,
          sharingMode: null,
          accessLevel: null,
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays correctly', () => {
      const state = reducer(createState({ teams: [createTeam()] }), setTeams([]));
      expect(state.teams).toEqual([]);
    });

    it('should handle multiple sequential updates', () => {
      let state = createState();
      state = reducer(state, setTeams([createTeam('1')]));
      state = reducer(state, setSelectedTeam(createTeam('1')));
      state = reducer(state, setChannels([createChannel('1')]));
      state = reducer(state, setSelectedDestination(createChannel('1')));
      state = reducer(state, setSharingMode(SharingMode.ANYONE));
      state = reducer(state, setAccessLevel('EDITOR'));
      state = reducer(state, setIsSharing(true));

      expect(state.teams).toHaveLength(1);
      expect(state.selectedTeam).not.toBeNull();
      expect(state.channels).toHaveLength(1);
      expect(state.selectedDestination).not.toBeNull();
      expect(state.sharingMode).toBe(SharingMode.ANYONE);
      expect(state.accessLevel).toBe('EDITOR');
      expect(state.isSharing).toBe(true);
    });
  });
});


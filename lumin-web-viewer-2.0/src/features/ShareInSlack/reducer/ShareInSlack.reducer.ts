import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  SlackChannel,
  SlackTeam,
  SlackRecipient,
  ShareInSlackState,
  SlackSharingMode,
} from '../interfaces/slack.interface';

const initialState: {
  teams: SlackTeam[];
  channels: SlackChannel[];
  recipients: SlackRecipient[];
  selectedTeam: SlackTeam | null;
  selectedDestination: SlackChannel | SlackRecipient | null;
  sharingMode: SlackSharingMode | null;
  accessLevel: string | null;
  isSharingQueueProcessing: boolean;
  sharedDocumentInfo: {
    documentId: string;
  } | null;
  isSharing: boolean;
} = {
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
};

export const shareInSlackSlice = createSlice({
  name: 'SHARE_IN_SLACK',
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<SlackTeam[]>) => {
      state.teams = action.payload;
    },
    setChannels: (state, action: PayloadAction<SlackChannel[]>) => {
      state.channels = action.payload;
    },
    setRecipients: (state, action: PayloadAction<SlackRecipient[]>) => {
      state.recipients = action.payload;
    },
    resetSlackStates: (state) => {
      state.teams = [];
      state.channels = [];
      state.recipients = [];
    },
    setSelectedTeam: (state, action: PayloadAction<SlackTeam | null>) => {
      state.selectedTeam = action.payload;
    },
    setSelectedDestination: (state, action: PayloadAction<SlackChannel | SlackRecipient | null>) => {
      state.selectedDestination = action.payload;
    },
    setSharingMode: (state, action: PayloadAction<SlackSharingMode | null>) => {
      state.sharingMode = action.payload;
    },
    setAccessLevel: (state, action: PayloadAction<string | null>) => {
      state.accessLevel = action.payload;
    },
    setTotalMembers: (state, action: PayloadAction<number | null>) => {
      if (state.selectedDestination && state.selectedDestination.isChannel) {
        (state.selectedDestination as SlackChannel).totalMembers = action.payload;
      }
    },
    setIsSharingQueueProcessing: (state, action: PayloadAction<boolean>) => {
      state.isSharingQueueProcessing = action.payload;
    },
    resetForm: (state) => {
      state.selectedTeam = null;
      state.selectedDestination = null;
      state.sharingMode = null;
      state.accessLevel = null;
    },
    setSharedDocumentInfo: (state, action: PayloadAction<{ documentId: string } | null>) => {
      state.sharedDocumentInfo = action.payload;
    },
    setIsSharing: (state, action: PayloadAction<boolean>) => {
      state.isSharing = action.payload;
    },
  },
});

export const {
  setTeams,
  setChannels,
  setRecipients,
  setSelectedTeam,
  setSelectedDestination,
  setSharingMode,
  setAccessLevel,
  setTotalMembers,
  setIsSharingQueueProcessing,
  resetForm,
  setSharedDocumentInfo,
  setIsSharing,
  resetSlackStates,
} = shareInSlackSlice.actions;

export const shareInSlackSelectors = {
  getTeams: (state: { shareInSlack: ShareInSlackState }) => state.shareInSlack.teams,
  getChannels: (state: { shareInSlack: ShareInSlackState }) => state.shareInSlack.channels,
  getRecipients: (state: { shareInSlack: ShareInSlackState }) => state.shareInSlack.recipients,
  getSelectedTeam: (state: { shareInSlack: ShareInSlackState }) => state.shareInSlack.selectedTeam,
  getSelectedDestination: (state: { shareInSlack: ShareInSlackState }) => state.shareInSlack.selectedDestination,
  getSharingMode: (state: { shareInSlack: ShareInSlackState }) => state.shareInSlack.sharingMode,
  getAccessLevel: (state: { shareInSlack: ShareInSlackState }) => state.shareInSlack.accessLevel,
  getFormData: (state: { shareInSlack: ShareInSlackState }) => ({
    selectedTeam: state.shareInSlack.selectedTeam,
    selectedDestination: state.shareInSlack.selectedDestination,
    sharingMode: state.shareInSlack.sharingMode,
    accessLevel: state.shareInSlack.accessLevel,
  }),
  getIsSharingQueueProcessing: (state: { shareInSlack: ShareInSlackState }) =>
    state.shareInSlack.isSharingQueueProcessing,
  getSharedDocumentInfo: (state: { shareInSlack: ShareInSlackState }) => state.shareInSlack.sharedDocumentInfo,
  getIsSharing: (state: { shareInSlack: ShareInSlackState }) => state.shareInSlack.isSharing,
};

export default shareInSlackSlice.reducer;

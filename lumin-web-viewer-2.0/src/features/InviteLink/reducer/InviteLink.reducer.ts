import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { InviteLink } from '../InviteLink.types';

type InviteLinkState = {
  inviteLinkData: InviteLink;
  currentInviteLinkData: InviteLink;
  selectedOrg: IOrganization;
  isCurrentInviteLinkLoading: boolean;
};

const initialState: InviteLinkState = {
  inviteLinkData: null,
  currentInviteLinkData: null,
  selectedOrg: {} as IOrganization,
  isCurrentInviteLinkLoading: true,
};

export const inviteLinkSlice = createSlice({
  name: 'INVITE_LINK',
  initialState,
  reducers: {
    setInviteLink: (state: InviteLinkState, action: PayloadAction<InviteLink>) => ({
      ...state,
      inviteLinkData: action.payload,
    }),
    setCurrentInviteLink: (state: InviteLinkState, action: PayloadAction<InviteLink>) => ({
      ...state,
      currentInviteLinkData: action.payload,
    }),
    setSelectedOrg: (state: InviteLinkState, action: PayloadAction<IOrganization>) => ({
      ...state,
      selectedOrg: action.payload,
    }),
    setIsCurrentInviteLinkLoading: (state: InviteLinkState, action: PayloadAction<boolean>) => ({
      ...state,
      isCurrentInviteLinkLoading: action.payload,
    }),
  },
});

export const { setInviteLink, setCurrentInviteLink, setSelectedOrg, setIsCurrentInviteLinkLoading } =
  inviteLinkSlice.actions;

export const inviteLinkSelectors = {
  getInviteLink: (state: { inviteLink: InviteLinkState }) => state.inviteLink.inviteLinkData,
  getCurrentInviteLink: (state: { inviteLink: InviteLinkState }) => state.inviteLink.currentInviteLinkData,
  getSelectedOrg: (state: { inviteLink: InviteLinkState }) => state.inviteLink.selectedOrg,
  getIsCurrentInviteLinkLoading: (state: { inviteLink: InviteLinkState }) =>
    state.inviteLink.isCurrentInviteLinkLoading,
};

export default inviteLinkSlice.reducer;

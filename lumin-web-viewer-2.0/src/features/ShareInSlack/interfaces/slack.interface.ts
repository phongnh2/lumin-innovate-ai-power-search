import { SharingMode } from '../constants';

export interface SlackTeam {
  id: string;
  name: string;
  domain: string;
  avatar: string;
}

export enum SlackConversationType {
  CHANNEL = 'CHANNEL',
  DIRECT_MESSAGE = 'DIRECT_MESSAGE',
}

export interface SlackConversation {
  id: string;
  type: SlackConversationType;
  isPrivate?: boolean;
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  totalMembers: number;
  isChannel?: boolean;
}

export interface SlackRecipient {
  id: string;
  name: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  isChannel?: boolean;
}

export interface ShareInSlackState {
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
}

export type SlackSharingMode = typeof SharingMode[keyof typeof SharingMode];

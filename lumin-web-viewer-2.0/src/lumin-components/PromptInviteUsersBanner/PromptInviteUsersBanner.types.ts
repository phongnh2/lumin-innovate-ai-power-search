import type { PromptInviteUsersBannerResponse } from 'services/types/documentServices.types';

import { IOrganization } from 'interfaces/organization/organization.interface';

export type PromptInviteGoogleUsersStorage = Record<
  string,
  {
    show: boolean;
    closeReason?: CloseBannerReason;
    expirationTime?: number;
  }
>;

export type ExpirationTimeByOrgProps = {
  orgId: string;
  show: boolean;
  closeReason?: CloseBannerReason;
};

export type PromptInviteGoogleUsersHandlerProps = {
  orgId: string;
  forceUpdate?: boolean;
};

export type CreateRequestPayloadProps = {
  orgId: string;
  forceUpdate: boolean;
};

export enum CloseBannerReason {
  CLICK_CLOSE_BTN = 'CLICK_CLOSE_BTN',
  HAS_NO_DATA = 'HAS_NO_DATA',
  FORCE_CLOSE = 'FORCE_CLOSE',
  CLICK_CTA_BTN = 'CLICK_CTA_BTN',
}

export type InviteUserAvatar = {
  src: string;
  name: string;
};

export type AddMemberOrganizationModalProps = {
  selectedOrganization: IOrganization;
  onClose: () => void;
  onSaved: () => void;
  updateCurrentOrganization: () => void;
  updateOrganizationInList: () => void;
};

export type PromptInviteUsersBannerContainerProps = {
  loading: boolean;
  content: {
    multiLanguageKey: string;
    attributes?: Record<string, string | number>;
  };
  onClose: (closeReason: CloseBannerReason) => void;
  onPreview: () => void;
  actionButtonText: string;
  inviteUserAvatars: InviteUserAvatar[];
  isShowAddMembersModal: boolean;
  addMemberOrganizationModalProps: AddMemberOrganizationModalProps;
  canShowBanner: boolean;
  isShowBanner: boolean;
  promptUsersData: PromptInviteUsersBannerResponse;
};

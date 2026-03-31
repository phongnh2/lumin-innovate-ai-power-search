import { AWS_EVENTS } from 'constants/awsEvents';

import { JoinViaInviteLinkErrorType, RegenerateInviteLinkTrigger } from './constants/InviteLinkEvent';
import { EventCollection } from './EventCollection';

type InviteLinkInfo = {
  inviteLinkID?: string;
  invitedRole?: string;
  workspaceID?: string;
  actorRole?: string;
  expireIn?: number;
};

type RegenerateInviteLink = Omit<InviteLinkInfo, 'expireIn'> & {
  oldLinkExpireIn?: number;
  trigger: RegenerateInviteLinkTrigger;
};

export class InviteLinkEventCollection extends EventCollection {
  private inviteLinkID: string;

  private invitedRole?: string;

  private workspaceID?: string;

  private actorRole?: string;

  private expireIn?: number;

  constructor({ inviteLinkID, invitedRole, workspaceID, actorRole, expireIn }: InviteLinkInfo) {
    super();
    this.inviteLinkID = inviteLinkID;
    this.invitedRole = invitedRole;
    this.workspaceID = workspaceID;
    this.actorRole = actorRole;
    this.expireIn = expireIn;
  }

  copyInviteLink(attributes?: InviteLinkInfo) {
    const mergedAttributes = {
      inviteLinkID: this.inviteLinkID,
      invitedRole: this.invitedRole,
      workspaceID: this.workspaceID,
      actorRole: this.actorRole,
      expireIn: this.expireIn,
      ...attributes,
    };
    return this.record({
      name: AWS_EVENTS.INVITE_LINK.COPY,
      attributes: mergedAttributes,
    });
  }

  regenerateInviteLink(attributes?: RegenerateInviteLink) {
    const mergedAttributes = {
      inviteLinkID: this.inviteLinkID,
      invitedRole: this.invitedRole,
      workspaceID: this.workspaceID,
      actorRole: this.actorRole,
      oldLinkExpireIn: this.expireIn,
      ...attributes,
    };
    return this.record({
      name: AWS_EVENTS.INVITE_LINK.REGENERATE,
      attributes: mergedAttributes,
    });
  }

  accessInviteLink(attributes?: InviteLinkInfo) {
    const mergedAttributes = {
      inviteLinkID: this.inviteLinkID,
      invitedRole: this.invitedRole,
      workspaceID: this.workspaceID,
      ...attributes,
    };
    return this.record({
      name: AWS_EVENTS.INVITE_LINK.ACCESS,
      attributes: mergedAttributes,
    });
  }

  deactivateInviteLink(attributes?: InviteLinkInfo) {
    const mergedAttributes = {
      inviteLinkID: this.inviteLinkID,
      invitedRole: this.invitedRole,
      workspaceID: this.workspaceID,
      ...attributes,
    };
    return this.record({
      name: AWS_EVENTS.INVITE_LINK.DEACTIVATE,
      attributes: mergedAttributes,
    });
  }

  joinViaInviteLinkSuccessfully(attributes?: InviteLinkInfo) {
    const mergedAttributes = {
      inviteLinkID: this.inviteLinkID,
      invitedRole: this.invitedRole,
      workspaceID: this.workspaceID,
      ...attributes,
    };
    return this.record({
      name: AWS_EVENTS.INVITE_LINK.JOIN_SUCCESS,
      attributes: mergedAttributes,
    });
  }

  joinViaInviteLinkError(attributes: InviteLinkInfo & { reason: JoinViaInviteLinkErrorType }) {
    const mergedAttributes = {
      inviteLinkID: this.inviteLinkID,
      invitedRole: this.invitedRole,
      workspaceID: this.workspaceID,
      ...attributes,
    };
    return this.record({
      name: AWS_EVENTS.INVITE_LINK.JOIN_ERROR,
      attributes: mergedAttributes,
    });
  }
}

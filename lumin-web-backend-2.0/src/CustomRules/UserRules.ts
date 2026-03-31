import { Utils } from 'Common/utils/Utils';

import { DocumentStorageEnum } from 'Document/document.enum';
import {
  DestinationType, InviteToOrganizationInput, ThirdPartyService,
  DocumentInput,
  FindUserPayload,
  SearchUserStatus,
  Organization,
} from 'graphql.schema';
import { User } from 'User/interfaces/user.interface';

import { CustomRuleLoader } from './custom-rule.loader';
import { CustomRulesService } from './custom-rule.service';
import {
  ORG_ACCESS_SCOPE,
  MEMBERSHIP_SCOPE,
  FILE_SERVICE,
  FILE_SCOPE,
  INVITE_SCOPE,
  SEARCH_SCOPE,
  UPLOADABLE_SERVICES,
  ALL_UPLOADABLE_SERVICES,
} from './domain-rules.constants';
import { RuleSet } from './domain-rules.schema';

class UserRules {
  private userDomain: string;

  private domainRules: RuleSet;

  private user: User;

  private allConfiguredDomains: string[];

  private restrictedActions: {
    cannotSearchFor: string[];
    cannotShareDocWith: string[];
    cannotInviteToOrg: string[];
    cannotRequestDocOf: string[];
    cannotJoinOrgsOf: string[];
  };

  constructor(
    private readonly customRulesService: CustomRulesService,
    private readonly customRuleLoader: CustomRuleLoader,
    user: User,
  ) {
    this.user = user;
    this.userDomain = user ? Utils.getEmailDomain(user?.email) : '';
    this.domainRules = this.customRuleLoader.getRulesForDomain(this.userDomain);
    this.allConfiguredDomains = this.customRuleLoader.getConfiguredDomains();

    this.setupRestrictedActions();
  }

  private setupRestrictedActions(): void {
    this.restrictedActions = {
      cannotSearchFor: [],
      cannotShareDocWith: [],
      cannotInviteToOrg: [],
      cannotRequestDocOf: [],
      cannotJoinOrgsOf: [],
    };

    this.allConfiguredDomains.forEach((domain) => {
      if (domain === this.userDomain) return;

      const rules = this.customRuleLoader.getRulesForDomain(domain);
      if (!rules) return;

      if (!rules.external.canSearch) {
        this.restrictedActions.cannotSearchFor.push(domain);
      }

      if (!rules.external.canInvite) {
        this.restrictedActions.cannotInviteToOrg.push(domain);
      }

      if (!rules.external.canShare) {
        this.restrictedActions.cannotShareDocWith.push(domain);
      }

      if (!rules.external.canJoinOrg) {
        this.restrictedActions.cannotJoinOrgsOf.push(domain);
      }

      if (!rules.external.canRequestDocs) {
        this.restrictedActions.cannotRequestDocOf.push(domain);
      }
    });
  }

  get onlyUseDriveStorage(): boolean {
    return this.domainRules.files.service === FILE_SERVICE.ONLY_DRIVE;
  }

  get onlyPersonalFile(): boolean {
    return this.domainRules.files.scope === FILE_SCOPE.PERSONAL_ONLY;
  }

  get allowToCreateOrg(): boolean {
    return this.domainRules.organization.allowOrgCreation;
  }

  get onlyInviteInternal(): boolean {
    return this.domainRules.collaboration.inviteScope === INVITE_SCOPE.INTERNAL_ONLY;
  }

  get onlyJoinOrg(): boolean {
    return this.domainRules.organization.membershipScope === MEMBERSHIP_SCOPE.INTERNAL_ONLY;
  }

  get orgId(): string {
    return this.domainRules.organization.domainOrgId;
  }

  get requireOrgMembershipOnSignIn(): boolean {
    return this.domainRules.organization.requireDomainMembership;
  }

  get autoJoinOrgAfterSignUp(): boolean {
    return this.domainRules.organization.autoJoinDomainOrg;
  }

  get onlySearchForInternal(): boolean {
    return this.domainRules.collaboration.searchScope === SEARCH_SCOPE.INTERNAL_ONLY;
  }

  get hidePromptDriveUsersBanner(): boolean {
    return this.domainRules.ui.hidePromptDriveUsersBanner;
  }

  get onlyAccessRestrictedOrg(): boolean {
    return this.domainRules.organization.orgAccessScope === ORG_ACCESS_SCOPE.INTERNAL_ONLY;
  }

  get allowToChangeEmail(): boolean {
    return this.domainRules.user.allowChangeEmail;
  }

  get allowFileIndexing(): boolean {
    return this.domainRules.files.allowIndexing ?? true;
  }

  get uploadableServices(): string[] {
    const services = this.domainRules.files.uploadableServices;

    // Default to all services if not configured or explicitly set to 'all'
    if (!services || services === UPLOADABLE_SERVICES.ALL) {
      return [...ALL_UPLOADABLE_SERVICES];
    }

    return services;
  }

  get hideAiChatbot(): boolean {
    return this.domainRules.ui.hideAiChatbot ?? false;
  }

  get cannotSearchFor(): string[] {
    return this.restrictedActions.cannotSearchFor;
  }

  get cannotShareDocWith(): string[] {
    return this.restrictedActions.cannotShareDocWith;
  }

  get cannotInviteToOrg(): string[] {
    return this.restrictedActions.cannotInviteToOrg;
  }

  get cannotRequestDocOf(): string[] {
    return this.restrictedActions.cannotRequestDocOf;
  }

  get cannotJoinOrgsOf(): string[] {
    return this.restrictedActions.cannotJoinOrgsOf;
  }

  get templateManagementEnabled(): boolean {
    return this.domainRules.files?.templateManagementEnabled ?? true;
  }

  getRestrictedDomains(): string[] {
    return this.allConfiguredDomains;
  }

  getRulesForDomain(domain: string): RuleSet | undefined {
    return this.customRuleLoader.getRulesForDomain(domain);
  }

  canShowPromptDriveUsersBanner(domain: string): boolean {
    const targetRules = this.customRuleLoader.getRulesForDomain(domain);
    return !targetRules.ui.hidePromptDriveUsersBanner;
  }

  canUploadThirdPartyDocuments({ documents, orgId }: { documents: DocumentInput[], orgId: string }): boolean {
    const storageAllowed = this.onlyUseDriveStorage ? documents.every((doc) => doc.service === ThirdPartyService.google) : true;
    const workspaceAllowed = this.onlyPersonalFile ? orgId === this.orgId : true;
    return storageAllowed && workspaceAllowed;
  }

  canUploadOrMoveToDestination(destinationId: string, destinationType = DestinationType.PERSONAL): boolean {
    if (this.onlyPersonalFile) {
      return destinationType === DestinationType.PERSONAL && destinationId === this.orgId;
    }
    if (this.onlyUseDriveStorage) {
      return destinationType === DestinationType.PERSONAL;
    }
    return true;
  }

  async canAccessDocument(documentId: string): Promise<boolean> {
    if (!this.onlyPersonalFile && !this.onlyUseDriveStorage) {
      return true;
    }
    const document = await this.customRulesService.getDocumentById(documentId);
    if (!document) {
      return true;
    }
    if (this.onlyPersonalFile) {
      const documentPermission = await this.customRulesService.getDocumentPermissionsByDocId({ documentId, userId: this.user._id });
      if (documentPermission?.workspace?.refId.toHexString() !== this.orgId) {
        return false;
      }
    }
    if (this.onlyUseDriveStorage && document.service !== DocumentStorageEnum.GOOGLE) {
      return false;
    }
    return true;
  }

  async canMoveDocuments({
    documentIds, destinationId, destinationType, folderId,
  }: {
    documentIds: string[], destinationId?: string, destinationType?: DestinationType, folderId?: string,
  }): Promise<boolean> {
    if (this.onlyPersonalFile || this.onlyUseDriveStorage) {
      await this.customRulesService.verifyDocumentsOrigin({ documentIds, workspaceId: this.orgId });
      let destinationWorkspace: string;
      if (folderId) {
        const folderPermission = await this.customRulesService.getOwnerFolderPermission({ folderId });
        if (this.onlyUseDriveStorage && !folderPermission) {
          return false;
        }
        destinationWorkspace = folderPermission?.workspace?.refId.toHexString();
      } else {
        destinationWorkspace = destinationId;
      }
      return this.canUploadOrMoveToDestination(destinationWorkspace, destinationType);
    }
    return true;
  }

  async canRequestAccessDocument({ documentId }: { documentId: string }): Promise<boolean> {
    const { cannotRequestDocOf: restrictedDomains } = this;
    const preventOrgIds = this.customRuleLoader.getOrgIdsFromDomain(restrictedDomains);
    const ownerDocPermission = await this.customRulesService.getOwnerDocumentPermission(documentId);
    return !preventOrgIds.includes(ownerDocPermission?.workspace?.refId.toHexString());
  }

  canShareDocument({ emails }: { emails: string[] }): boolean {
    const emailDomains = emails.map((email) => Utils.getEmailDomain(email));
    return emailDomains.every((emailDomain, index) => this.isSameOrg(emails[index]) || !this.cannotShareDocWith.includes(emailDomain));
  }

  canInviteMemberToOrg(members: InviteToOrganizationInput[]): boolean {
    const userDomain = Utils.getEmailDomain(this.user.email);
    const memberDomains = members.map((member) => Utils.getEmailDomain(member.email));
    if (this.onlyInviteInternal) {
      return memberDomains.every((memberDomain, index) => this.isSameOrg(members[index].email) || (memberDomain === userDomain));
    }
    const cannotInviteDomains = this.cannotInviteToOrg;
    return memberDomains.every((memberDomain, index) => this.isSameOrg(members[index].email) || !cannotInviteDomains.includes(memberDomain));
  }

  canRequestToJoinOrg(orgId: string): boolean {
    if (this.onlyJoinOrg) {
      return this.orgId === orgId;
    }
    const { cannotJoinOrgsOf: restrictedDomains } = this;
    const preventOrgIds = this.customRuleLoader.getOrgIdsFromDomain(restrictedDomains);
    if (preventOrgIds) {
      return !preventOrgIds.includes(orgId);
    }

    return true;
  }

  interceptFindUserPayload(payload: FindUserPayload[]): FindUserPayload[] {
    const userDomain = Utils.getEmailDomain(this.user.email);
    return payload.map((contact) => {
      const domain = Utils.getEmailDomain(contact.email);
      if (!this.isSameOrg(contact.email) && (this.cannotSearchFor.includes(domain) || this.onlySearchForInternal && domain !== userDomain)) {
        return {
          ...contact,
          status: SearchUserStatus.USER_RESTRICTED,
        };
      }
      return contact;
    });
  }

  canAccessOrg(org: Organization): boolean {
    if (this.onlyAccessRestrictedOrg) {
      return org._id === this.orgId;
    }
    return true;
  }

  filterRestrictedDomain(data: FindUserPayload[]): FindUserPayload[] {
    return data.filter((contact) => {
      const domain = Utils.getEmailDomain(contact.email);
      return !this.cannotSearchFor.includes(domain);
    });
  }

  getEmailChangeEligibility({
    currentEmail,
    newEmail,
  }: {
    currentEmail: string;
    newEmail?: string;
  }): { isRestrictedDomain: boolean; allowToChangeEmail: boolean } {
    const currentDomain = Utils.getEmailDomain(currentEmail);
    const currentRules = this.customRuleLoader.getRulesForDomain(currentDomain);
    const restrictedDomains = this.allConfiguredDomains;

    if (!newEmail) {
      return {
        isRestrictedDomain: restrictedDomains.includes(currentDomain),
        allowToChangeEmail: Boolean(currentRules.user.allowChangeEmail),
      };
    }

    const newDomain = Utils.getEmailDomain(newEmail);
    const newRules = this.customRuleLoader.getRulesForDomain(newDomain);
    return {
      isRestrictedDomain: restrictedDomains.includes(newDomain),
      allowToChangeEmail: Boolean(newRules.user.allowChangeEmail) && Boolean(currentRules.user.allowChangeEmail),
    };
  }

  isSameOrg(targetEmail: string): boolean {
    if (!this.orgId) {
      return false;
    }
    const targetDomain = Utils.getEmailDomain(targetEmail);
    const targetRules = this.customRuleLoader.getRulesForDomain(targetDomain);
    if (!targetRules.organization.domainOrgId) {
      return false;
    }
    return this.orgId === targetRules.organization.domainOrgId;
  }
}

export default UserRules;

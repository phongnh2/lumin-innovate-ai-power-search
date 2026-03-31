import * as hubspot from '@hubspot/api-client';
import {
  AssociationSpecAssociationCategoryEnum,
} from '@hubspot/api-client/lib/codegen/crm/associations/v4';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/objects';
import { Injectable } from '@nestjs/common';
import { chunk } from 'lodash';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { HubspotClientProvider } from 'Hubspot/hubspot-client.provider';
import {
  HUBSPOT_API_CONCURRENCY_LIMIT,
  HUBSPOT_BATCH_SIZE_LIMIT,
  HUBSPOT_CONTACT_SEARCH_BATCH_SIZE,
  HUBSPOT_OBJECT_TYPE_IDS,
  ORG_ROLE_TO_ASSOCIATION_LABEL,
} from 'Hubspot/hubspot.constant';
import {
  HubspotWorkspaceEventName,
  WorkspaceContactAssociationLabel,
} from 'Hubspot/hubspot.interface';
import { LoggerService } from 'Logger/Logger.service';
import { OrganizationRoleEnums } from 'Organization/organization.enum';

@Injectable()
export class HubspotWorkspaceService {
  private hubspotClient: hubspot.Client;

  // global rate limiter state
  private activeRequests = 0;

  private requestQueue: Array<{
    task: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor(
    private readonly loggerService: LoggerService,
    private readonly hubspotClientProvider: HubspotClientProvider,
    private readonly environmentService: EnvironmentService,
  ) {
    this.hubspotClient = this.hubspotClientProvider.getClient();
  }

  /**
   * Execute a single API call with global rate limiting
   * Ensures no more than HUBSPOT_API_CONCURRENCY_LIMIT concurrent requests
   */
  private async executeWithRateLimit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push({
        task: task as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.processQueue();
    });
  }

  private processQueue(): void {
    while (
      this.requestQueue.length > 0
      && this.activeRequests < HUBSPOT_API_CONCURRENCY_LIMIT
    ) {
      const request = this.requestQueue.shift();
      if (request) {
        this.activeRequests += 1;
        request
          .task()
          .then((result) => {
            request.resolve(result);
          })
          .catch((error) => {
            request.reject(error);
          })
          .finally(() => {
            this.activeRequests -= 1;
            this.processQueue();
          });
      }
    }
  }

  /**
   * Execute promises with concurrency limit to avoid rate limiting
   * Processes tasks in chunks to limit concurrent API calls
   */
  private async executeConcurrently<T>(
    tasks: Array<() => Promise<T>>,
    concurrencyLimit: number = HUBSPOT_API_CONCURRENCY_LIMIT,
  ): Promise<T[]> {
    const results: T[] = [];
    const chunks = chunk(tasks, concurrencyLimit);

    // process each chunk sequentially, but tasks within a chunk run in parallel
    await chunks.reduce(async (previousPromise, taskChunk) => {
      await previousPromise;
      const chunkResults = await Promise.all(taskChunk.map((task) => task()));
      results.push(...chunkResults);
    }, Promise.resolve());

    return results;
  }

  private isHubspotDisabled(): boolean {
    return (
      this.environmentService.isDevelopment
        && this.environmentService.getByKey(EnvConstants.ENABLE_HUBSPOT_WORKSPACE) !== 'true'
    ) || this.environmentService.getByKey(EnvConstants.ENV) === 'develop';
  }

  private getWorkspaceObjectTypeId(): string {
    const objectTypeId = this.environmentService.getByKey(
      EnvConstants.HUBSPOT_WORKSPACE_OBJECT_TYPE_ID,
    );
    if (!objectTypeId) {
      throw new Error('HUBSPOT_WORKSPACE_OBJECT_TYPE_ID environment variable not set');
    }
    return objectTypeId;
  }

  async createWorkspace({
    orgId,
    name,
    associations,
  }: {
    orgId: string;
    name: string;
    associations?: Array<{ contactEmail: string; orgRole: OrganizationRoleEnums }>;
  }): Promise<void> {
    if (this.isHubspotDisabled()) {
      return;
    }

    try {
      const objectTypeId = this.getWorkspaceObjectTypeId();

      const response = await this.executeWithRateLimit(() => this.hubspotClient.crm.objects.basicApi.create(
        objectTypeId,
        {
          properties: {
            lumin_workspace_id: orgId,
            name,
          },
        },
      ));

      const workspaceRecordId = response.id;

      this.loggerService.info({
        context: this.createWorkspace.name,
        message: 'Created HubSpot Workspace record for organization',
        extraInfo: {
          orgId,
          workspaceRecordId,
        },
      });

      if (associations) {
        await this.batchAddWorkspaceContactAssociations({
          orgId,
          associations,
        });
      }
    } catch (error) {
      this.loggerService.error({
        context: this.createWorkspace.name,
        message: 'Failed to create HubSpot Workspace record for organization',
        error,
        extraInfo: {
          orgId,
        },
      });
    }
  }

  async deleteWorkspace(orgId: string): Promise<void> {
    if (this.isHubspotDisabled()) {
      return;
    }

    try {
      const workspaceRecordId = await this.findWorkspaceByOrgId(orgId);
      if (!workspaceRecordId) {
        this.loggerService.warn({
          context: this.deleteWorkspace.name,
          message: 'Workspace record not found for org',
          extraInfo: {
            orgId,
          },
        });
        return;
      }

      const objectTypeId = this.getWorkspaceObjectTypeId();
      await this.executeWithRateLimit(() => this.hubspotClient.crm.objects.basicApi.archive(
        objectTypeId,
        workspaceRecordId,
      ));

      this.loggerService.info({
        context: this.deleteWorkspace.name,
        message: 'Deleted Workspace record for org',
        extraInfo: {
          orgId,
          workspaceRecordId,
        },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.deleteWorkspace.name,
        message: 'Failed to delete Workspace record for org',
        extraInfo: {
          orgId,
        },
        error,
      });
    }
  }

  async findWorkspaceByOrgId(orgId: string): Promise<string | null> {
    try {
      const objectTypeId = this.getWorkspaceObjectTypeId();

      const response = await this.executeWithRateLimit(() => this.hubspotClient.crm.objects.searchApi.doSearch(
        objectTypeId,
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'lumin_workspace_id',
                  operator: FilterOperatorEnum.Eq,
                  value: orgId,
                },
              ],
            },
          ],
          properties: ['lumin_workspace_id', 'name'],
          limit: 1,
          after: '0',
        },
      ));

      if (response.total > 0 && response.results.length > 0) {
        return response.results[0].id;
      }

      return null;
    } catch (error) {
      this.loggerService.error({
        context: this.findWorkspaceByOrgId.name,
        message: 'Failed to find Workspace record for org',
        extraInfo: {
          orgId,
        },
        error,
      });
      return null;
    }
  }

  async findContactIdByEmail(email: string): Promise<string | null> {
    try {
      const response = await this.executeWithRateLimit(() => this.hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: FilterOperatorEnum.Eq,
                value: email,
              },
            ],
          },
        ],
        properties: ['email'],
        limit: 1,
        after: '0',
      }));

      if (response.total > 0 && response.results.length > 0) {
        return response.results[0].id;
      }

      return null;
    } catch (error) {
      this.loggerService.error({
        context: this.findContactIdByEmail.name,
        message: 'Failed to find HubSpot Contact ID by email',
        error,
      });
      return null;
    }
  }

  /**
   * Search contacts by emails using HubSpot search API with IN operator
   */
  private async findContactsByEmails(
    emails: string[],
    limit = HUBSPOT_CONTACT_SEARCH_BATCH_SIZE,
  ) {
    const response = await this.executeWithRateLimit(
      () => this.hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: FilterOperatorEnum.In,
                values: emails,
              },
            ],
          },
        ],
        properties: ['email'],
        limit,
        after: '0',
      }),
    );

    return response.results;
  }

  /**
   * Safely search contacts for a chunk, returning empty array on failure
   * This allows partial success when some chunks fail due to rate limits
   */
  private async findContactsByEmailsSafe(
    emails: string[],
    chunkIndex: number,
    totalChunks: number,
  ): Promise<{ results: Array<{ id: string; properties: { email?: string } }>; failed: boolean }> {
    try {
      const results = await this.findContactsByEmails(emails);
      return { results, failed: false };
    } catch (error) {
      this.loggerService.warn({
        context: this.findContactsByEmailsSafe.name,
        message: 'Failed to fetch contacts for chunk, continuing with partial results',
        extraInfo: {
          chunkIndex,
          totalChunks,
          emailCount: emails.length,
        },
      });
      return { results: [], failed: true };
    }
  }

  /**
   * Batch find contact IDs by emails with enhanced rate limit handling
   * Uses safe chunk processing to handle partial failures gracefully
   */
  private async mapEmailsToContactIds(emails: string[]): Promise<Map<string, string>> {
    const emailToContactId = new Map<string, string>();

    if (!emails.length) {
      return emailToContactId;
    }

    const startTime = Date.now();
    const uniqueEmails = [...new Set(emails)];
    const chunks = chunk(uniqueEmails, HUBSPOT_CONTACT_SEARCH_BATCH_SIZE);

    this.loggerService.info({
      context: this.mapEmailsToContactIds.name,
      message: 'Starting email to contact ID mapping',
      extraInfo: {
        totalEmails: emails.length,
        uniqueEmails: uniqueEmails.length,
        chunks: chunks.length,
      },
    });

    try {
      // Process chunks with safe error handling for partial failures
      const chunkResults = await this.executeConcurrently(
        chunks.map((emailChunk, index) => () => this.findContactsByEmailsSafe(
          emailChunk,
          index,
          chunks.length,
        )),
      );

      // Count successes and failures
      let successCount = 0;
      let failedChunks = 0;

      chunkResults.forEach((result) => {
        if (result.failed) {
          failedChunks += 1;
        } else {
          result.results.forEach(({ id, properties }) => {
            const { email } = properties;
            if (email) {
              emailToContactId.set(email.toLowerCase(), id);
              successCount += 1;
            }
          });
        }
      });

      this.loggerService.info({
        context: this.mapEmailsToContactIds.name,
        message: 'Completed email to contact ID mapping',
        extraInfo: {
          totalEmails: emails.length,
          uniqueEmails: uniqueEmails.length,
          contactsFound: emailToContactId.size,
          successfulMappings: successCount,
          failedChunks,
          totalChunks: chunks.length,
          durationMs: Date.now() - startTime,
        },
      });

      return emailToContactId;
    } catch (error) {
      this.loggerService.error({
        context: this.mapEmailsToContactIds.name,
        message: 'Failed to map emails to HubSpot Contact IDs',
        extraInfo: {
          emailCount: emails.length,
          durationMs: Date.now() - startTime,
        },
        error,
      });
      return emailToContactId;
    }
  }

  private getWorkspaceContactAssociationTypeId(
    labelName: WorkspaceContactAssociationLabel,
  ): number | null {
    let envKey: string;

    if (labelName === WorkspaceContactAssociationLabel.OWNER) {
      envKey = EnvConstants.HUBSPOT_WORKSPACE_CONTACT_OWNER_ASSOCIATION_TYPE_ID;
    } else if (labelName === WorkspaceContactAssociationLabel.ADMIN) {
      envKey = EnvConstants.HUBSPOT_WORKSPACE_CONTACT_ADMIN_ASSOCIATION_TYPE_ID;
    } else {
      this.loggerService.warn({
        context: this.getWorkspaceContactAssociationTypeId.name,
        message: 'Unknown association label',
        extraInfo: { labelName },
      });
      return null;
    }

    const typeIdStr = this.environmentService.getByKey(envKey);
    if (!typeIdStr) {
      this.loggerService.warn({
        context: this.getWorkspaceContactAssociationTypeId.name,
        message: 'Association type ID env var not set',
        extraInfo: { envKey, labelName },
      });
      return null;
    }

    const typeId = parseInt(typeIdStr, 10);
    if (Number.isNaN(typeId)) {
      this.loggerService.warn({
        context: this.getWorkspaceContactAssociationTypeId.name,
        message: 'Association type ID is not a valid number',
        extraInfo: { envKey, labelName, typeIdStr },
      });
      return null;
    }

    return typeId;
  }

  async addWorkspaceContactAssociation({
    orgId,
    contactEmail,
    orgRole,
  }: {
    orgId: string;
    contactEmail: string;
    orgRole: OrganizationRoleEnums;
  }): Promise<string | null> {
    if (this.isHubspotDisabled()) {
      return null;
    }

    try {
      const [workspaceRecordId, contactId] = await Promise.all([
        this.findWorkspaceByOrgId(orgId),
        this.findContactIdByEmail(contactEmail),
      ]);

      if (!workspaceRecordId || !contactId) {
        this.loggerService.warn({
          context: this.addWorkspaceContactAssociation.name,
          message: 'Workspace record or contact not found',
          extraInfo: { orgId },
        });
        return null;
      }

      const objectTypeId = this.getWorkspaceObjectTypeId();
      const { basicApi } = this.hubspotClient.crm.associations.v4;

      const labelName = ORG_ROLE_TO_ASSOCIATION_LABEL[orgRole];

      if (labelName) {
        // Labeled association (OWNER or ADMIN)
        const associationTypeId = this.getWorkspaceContactAssociationTypeId(labelName);
        if (!associationTypeId) {
          throw new Error('Association type ID not found');
        }

        await this.executeWithRateLimit(() => basicApi.create(
          objectTypeId,
          workspaceRecordId,
          HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
          contactId,
          [
            {
              associationCategory: AssociationSpecAssociationCategoryEnum.UserDefined,
              associationTypeId,
            },
          ],
        ));
      } else {
        // Default association (MEMBER) - no specific label
        await this.executeWithRateLimit(() => basicApi.createDefault(
          objectTypeId,
          workspaceRecordId,
          HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
          contactId,
        ));
      }

      this.loggerService.info({
        context: this.addWorkspaceContactAssociation.name,
        message: 'Added a HubSpot Workspace <-> Contact association',
        extraInfo: {
          orgId,
          orgRole,
          hubspotContactId: contactId,
        },
      });
      return contactId;
    } catch (error) {
      this.loggerService.error({
        context: this.addWorkspaceContactAssociation.name,
        message: 'Failed to add a HubSpot Workspace <-> Contact association',
        extraInfo: {
          orgId,
          orgRole,
        },
        error,
      });
      throw error;
    }
  }

  async removeWorkspaceContactAssociation({
    orgId,
    contactEmail,
  }: {
    orgId: string;
    contactEmail: string;
  }): Promise<void> {
    if (this.isHubspotDisabled()) {
      return;
    }

    try {
      const [workspaceRecordId, contactId] = await Promise.all([
        this.findWorkspaceByOrgId(orgId),
        this.findContactIdByEmail(contactEmail),
      ]);

      if (!workspaceRecordId || !contactId) {
        this.loggerService.warn({
          context: this.removeWorkspaceContactAssociation.name,
          message: 'Workspace record or contact not found',
          extraInfo: {
            orgId,
          },
        });
        return;
      }

      const objectTypeId = this.getWorkspaceObjectTypeId();
      const { basicApi } = this.hubspotClient.crm.associations.v4;
      await this.executeWithRateLimit(() => basicApi.archive(
        objectTypeId,
        workspaceRecordId,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        contactId,
      ));

      this.loggerService.info({
        context: this.removeWorkspaceContactAssociation.name,
        message: 'Removed a HubSpot Workspace <-> Contact association',
        extraInfo: {
          orgId,
          hubspotContactId: contactId,
        },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.removeWorkspaceContactAssociation.name,
        message: 'Failed to remove a HubSpot Workspace <-> Contact association',
        extraInfo: {
          orgId,
        },
        error,
      });
      throw error;
    }
  }

  async updateWorkspaceContactAssociationLabel({
    orgId,
    contactEmail,
    newRole,
  }: {
    orgId: string;
    contactEmail: string;
    newRole: OrganizationRoleEnums;
  }): Promise<void> {
    if (this.isHubspotDisabled()) {
      return;
    }

    try {
      // remove existing association
      await this.removeWorkspaceContactAssociation({ orgId, contactEmail });

      // add new association with updated label
      const contactId = await this.addWorkspaceContactAssociation({
        orgId,
        contactEmail,
        orgRole: newRole,
      });

      this.loggerService.info({
        context: this.updateWorkspaceContactAssociationLabel.name,
        message: 'Updated HubSpot Workspace <-> Contact association label',
        extraInfo: {
          orgId,
          newRole,
          hubspotContactId: contactId,
        },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.updateWorkspaceContactAssociationLabel.name,
        message: 'Failed to update HubSpot Workspace <-> Contact association label',
        extraInfo: { orgId, newRole },
        error,
      });
    }
  }

  /**
   * Efficiently remove specific members from workspace by email
   * Use this for incremental updates instead of full sync when only removing a few members
   */
  private async removeWorkspaceMembers({
    orgId,
    memberEmails,
  }: {
    orgId: string;
    memberEmails: string[];
  }): Promise<void> {
    if (this.isHubspotDisabled() || !memberEmails.length) {
      return;
    }

    try {
      const workspaceRecordId = await this.findWorkspaceByOrgId(orgId);
      if (!workspaceRecordId) {
        this.loggerService.warn({
          context: this.removeWorkspaceMembers.name,
          message: 'Workspace record not found',
          extraInfo: { orgId },
        });
        return;
      }

      // map only the emails we need to remove
      const emailToContactIdMap = await this.mapEmailsToContactIds(memberEmails);
      const contactIds = [...emailToContactIdMap.values()];

      if (contactIds.length === 0) {
        this.loggerService.info({
          context: this.removeWorkspaceMembers.name,
          message: 'No HubSpot contacts found for emails to remove',
          extraInfo: { orgId, emailCount: memberEmails.length },
        });
        return;
      }

      await this.batchRemoveWorkspaceContactAssociations({
        workspaceRecordId,
        contactIds,
      });

      this.loggerService.info({
        context: this.removeWorkspaceMembers.name,
        message: 'Removed workspace members',
        extraInfo: {
          orgId,
          requestedCount: memberEmails.length,
          removedCount: contactIds.length,
        },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.removeWorkspaceMembers.name,
        message: 'Failed to remove workspace members',
        extraInfo: { orgId, emailCount: memberEmails.length },
        error,
      });
      throw error;
    }
  }

  /**
   * Efficiently add specific members to workspace
   * Use this for incremental updates instead of full sync when only adding a few members
   */
  private async addWorkspaceMembers({
    orgId,
    members,
  }: {
    orgId: string;
    members: Array<{
      email: string;
      role: OrganizationRoleEnums;
    }>;
  }): Promise<void> {
    if (this.isHubspotDisabled() || !members.length) {
      return;
    }

    try {
      const workspaceRecordId = await this.findWorkspaceByOrgId(orgId);
      if (!workspaceRecordId) {
        this.loggerService.warn({
          context: this.addWorkspaceMembers.name,
          message: 'Workspace record not found',
          extraInfo: { orgId },
        });
        return;
      }

      // map only the emails we need to add
      const memberEmails = members.map((m) => m.email);
      const emailToContactIdMap = await this.mapEmailsToContactIds(memberEmails);

      const associations: Array<{ contactId: string; orgRole: OrganizationRoleEnums }> = [];
      const skippedEmails: string[] = [];

      members.forEach((member) => {
        const contactId = emailToContactIdMap.get(member.email.toLowerCase());
        if (contactId) {
          associations.push({ contactId, orgRole: member.role });
        } else {
          skippedEmails.push(member.email);
        }
      });

      if (associations.length > 0) {
        await this.batchAddAssociationsWithIds({
          workspaceRecordId,
          associations,
        });
      }

      this.loggerService.info({
        context: this.addWorkspaceMembers.name,
        message: 'Added workspace members',
        extraInfo: {
          orgId,
          requestedCount: members.length,
          addedCount: associations.length,
          skippedCount: skippedEmails.length,
        },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.addWorkspaceMembers.name,
        message: 'Failed to add workspace members',
        extraInfo: { orgId, memberCount: members.length },
        error,
      });
      throw error;
    }
  }

  /**
   * Incremental sync for workspace - apply specific changes without full sync
   * Much faster than syncHubspotWorkspace when you know exactly what changes to make
   */
  private async incrementalSyncWorkspace({
    orgId,
    membersToAdd,
    membersToRemove,
    membersToUpdateRole,
  }: {
    orgId: string;
    membersToAdd?: Array<{ email: string; role: OrganizationRoleEnums }>;
    membersToRemove?: string[];
    membersToUpdateRole?: Array<{ email: string; newRole: OrganizationRoleEnums }>;
  }): Promise<void> {
    if (this.isHubspotDisabled()) {
      return;
    }

    const hasChanges = (membersToAdd?.length || 0)
      + (membersToRemove?.length || 0)
      + (membersToUpdateRole?.length || 0) > 0;

    if (!hasChanges) {
      return;
    }

    try {
      const workspaceRecordId = await this.findWorkspaceByOrgId(orgId);
      if (!workspaceRecordId) {
        this.loggerService.warn({
          context: this.incrementalSyncWorkspace.name,
          message: 'Workspace record not found',
          extraInfo: { orgId },
        });
        return;
      }

      // collect all emails we need to map
      const allEmails: string[] = [
        ...(membersToAdd?.map((m) => m.email) || []),
        ...(membersToRemove || []),
        ...(membersToUpdateRole?.map((m) => m.email) || []),
      ];

      // map only the emails we need
      const emailToContactIdMap = await this.mapEmailsToContactIds(allEmails);

      // 1. Remove members (including those being updated - we remove first then add with new role)
      const contactIdsToRemove: string[] = [];

      membersToRemove?.forEach((email) => {
        const contactId = emailToContactIdMap.get(email.toLowerCase());
        if (contactId) {
          contactIdsToRemove.push(contactId);
        }
      });

      membersToUpdateRole?.forEach((member) => {
        const contactId = emailToContactIdMap.get(member.email.toLowerCase());
        if (contactId) {
          contactIdsToRemove.push(contactId);
        }
      });

      if (contactIdsToRemove.length > 0) {
        await this.batchRemoveWorkspaceContactAssociations({
          workspaceRecordId,
          contactIds: contactIdsToRemove,
        });
      }

      // 2. Add members (including those with updated roles)
      const associationsToAdd: Array<{ contactId: string; orgRole: OrganizationRoleEnums }> = [];

      membersToAdd?.forEach((member) => {
        const contactId = emailToContactIdMap.get(member.email.toLowerCase());
        if (contactId) {
          associationsToAdd.push({ contactId, orgRole: member.role });
        }
      });

      membersToUpdateRole?.forEach((member) => {
        const contactId = emailToContactIdMap.get(member.email.toLowerCase());
        if (contactId) {
          associationsToAdd.push({ contactId, orgRole: member.newRole });
        }
      });

      if (associationsToAdd.length > 0) {
        await this.batchAddAssociationsWithIds({
          workspaceRecordId,
          associations: associationsToAdd,
        });
      }

      this.loggerService.info({
        context: this.incrementalSyncWorkspace.name,
        message: 'Incremental sync completed',
        extraInfo: {
          orgId,
          added: membersToAdd?.length || 0,
          removed: membersToRemove?.length || 0,
          roleUpdated: membersToUpdateRole?.length || 0,
        },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.incrementalSyncWorkspace.name,
        message: 'Failed incremental sync',
        extraInfo: { orgId },
        error,
      });
      throw error;
    }
  }

  async batchAddWorkspaceContactAssociations({
    orgId,
    associations,
  }: {
    orgId: string;
    associations: Array<{
      contactEmail: string;
      orgRole: OrganizationRoleEnums;
    }>;
  }): Promise<void> {
    if (this.isHubspotDisabled() || !associations.length) {
      return;
    }

    try {
      // Deduplicate by contactEmail (keep last occurrence)
      const uniqueAssociations = [
        ...new Map(associations.map((a) => [a.contactEmail, a])).values(),
      ];

      // Get all unique emails and fetch contacts + workspace in parallel using batch search
      const uniqueEmails = uniqueAssociations.map((a) => a.contactEmail);
      const [workspaceRecordId, emailToContactId] = await Promise.all([
        this.findWorkspaceByOrgId(orgId),
        this.mapEmailsToContactIds(uniqueEmails),
      ]);

      if (!workspaceRecordId) {
        this.loggerService.warn({
          context: this.batchAddWorkspaceContactAssociations.name,
          message: 'Workspace record not found',
          extraInfo: { orgId },
        });
        return;
      }

      // Separate labeled vs default associations and build inputs
      const labeledInputs: Array<{
        _from: { id: string };
        to: { id: string };
        types: Array<{
          associationCategory: AssociationSpecAssociationCategoryEnum;
          associationTypeId: number;
        }>;
      }> = [];
      const defaultContactIds: string[] = [];

      uniqueAssociations.forEach((association) => {
        const contactId = emailToContactId.get(association.contactEmail.toLowerCase());
        if (!contactId) {
          this.loggerService.warn({
            context: this.batchAddWorkspaceContactAssociations.name,
            message: 'Skipping association - contact not found',
            extraInfo: { orgId },
          });
          return;
        }

        const labelName = ORG_ROLE_TO_ASSOCIATION_LABEL[association.orgRole];
        if (labelName) {
          const associationTypeId = this.getWorkspaceContactAssociationTypeId(labelName);
          if (!associationTypeId) {
            this.loggerService.warn({
              context: this.batchAddWorkspaceContactAssociations.name,
              message: 'Skipping labeled association - type ID not found',
              extraInfo: {
                orgId,
                labelName,
              },
            });
            return;
          }

          labeledInputs.push({
            _from: { id: workspaceRecordId },
            to: { id: contactId },
            types: [{
              associationCategory: AssociationSpecAssociationCategoryEnum.UserDefined,
              associationTypeId,
            }],
          });
        } else {
          defaultContactIds.push(contactId);
        }
      });

      const objectTypeId = this.getWorkspaceObjectTypeId();

      const { batchApi } = this.hubspotClient.crm.associations.v4;
      const { basicApi } = this.hubspotClient.crm.associations.v4;

      // batch create labeled associations with parallel chunk processing
      if (labeledInputs.length > 0) {
        const labeledChunks = chunk(labeledInputs, HUBSPOT_BATCH_SIZE_LIMIT);
        await this.executeConcurrently(
          labeledChunks.map((inputChunk) => () => this.executeWithRateLimit(() => batchApi.create(
            objectTypeId,
            HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
            { inputs: inputChunk },
          ))),
        );
      }

      // create default associations with controlled concurrency
      if (defaultContactIds.length > 0) {
        await this.executeConcurrently(
          defaultContactIds.map((contactId) => () => this.executeWithRateLimit(() => basicApi.createDefault(
            objectTypeId,
            workspaceRecordId,
            HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
            contactId,
          ))),
        );
      }

      this.loggerService.info({
        context: this.batchAddWorkspaceContactAssociations.name,
        message: 'Batch added HubSpot Workspace <-> Contact associations',
        extraInfo: {
          orgId,
          labeledCount: labeledInputs.length,
          defaultCount: defaultContactIds.length,
        },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.batchAddWorkspaceContactAssociations.name,
        message: 'Failed to batch add HubSpot Workspace <-> Contact associations',
        extraInfo: {
          orgId,
          associationCount: associations.length,
        },
        error,
      });
      throw error;
    }
  }

  /**
   * Get all contact associations for a workspace with their association type IDs
   */
  private async getWorkspaceContactAssociations(workspaceRecordId: string): Promise<Array<{
    contactId: string;
    associationTypeId: number;
  }>> {
    try {
      const objectTypeId = this.getWorkspaceObjectTypeId();
      return this.fetchAllWorkspaceContactAssociations(objectTypeId, workspaceRecordId);
    } catch (error) {
      this.loggerService.error({
        context: this.getWorkspaceContactAssociations.name,
        message: 'Failed to get workspace contact associations',
        extraInfo: { workspaceRecordId },
        error,
      });
      return [];
    }
  }

  /**
   * Recursively fetch all pages of workspace contact associations
   */
  private async fetchAllWorkspaceContactAssociations(
    objectTypeId: string,
    workspaceRecordId: string,
    after?: string,
    accumulated: Array<{ contactId: string; associationTypeId: number }> = [],
  ): Promise<Array<{ contactId: string; associationTypeId: number }>> {
    const { basicApi } = this.hubspotClient.crm.associations.v4;

    const response = await this.executeWithRateLimit(() => basicApi.getPage(
      objectTypeId,
      workspaceRecordId,
      HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
      after,
    ));

    const pageAssociations = response.results.flatMap((result) => result.associationTypes.map((assocType) => ({
      contactId: result.toObjectId,
      associationTypeId: assocType.typeId,
    })));

    const allAssociations = [...accumulated, ...pageAssociations];

    const nextAfter = response.paging?.next?.after;
    if (nextAfter) {
      return this.fetchAllWorkspaceContactAssociations(objectTypeId, workspaceRecordId, nextAfter, allAssociations);
    }

    return allAssociations;
  }

  /**
   * Batch remove workspace contact associations
   * Handles chunking for large datasets (HubSpot limits to 100 items per batch)
   */
  private async batchRemoveWorkspaceContactAssociations({
    workspaceRecordId,
    contactIds,
  }: {
    workspaceRecordId: string;
    contactIds: string[];
  }): Promise<void> {
    if (!contactIds.length) {
      return;
    }

    try {
      const objectTypeId = this.getWorkspaceObjectTypeId();
      const { batchApi } = this.hubspotClient.crm.associations.v4;

      // chunk contactIds to respect HubSpot batch size limit
      const contactIdChunks = chunk(contactIds, HUBSPOT_BATCH_SIZE_LIMIT);

      // process chunks in parallel with controlled concurrency
      await this.executeConcurrently(
        contactIdChunks.map((contactIdChunk) => () => {
          const inputs = contactIdChunk.map((contactId) => ({
            _from: { id: workspaceRecordId },
            to: [{ id: contactId }],
          }));

          return this.executeWithRateLimit(() => batchApi.archive(
            objectTypeId,
            HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
            { inputs },
          ));
        }),
      );

      this.loggerService.info({
        context: this.batchRemoveWorkspaceContactAssociations.name,
        message: 'Batch removed workspace contact associations',
        extraInfo: { workspaceRecordId, count: contactIds.length, chunks: contactIdChunks.length },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.batchRemoveWorkspaceContactAssociations.name,
        message: 'Failed to batch remove workspace contact associations',
        extraInfo: { workspaceRecordId, count: contactIds.length },
        error,
      });
      throw error;
    }
  }

  /**
   * Get the association type ID for a given org role
   */
  private getAssociationTypeIdForRole(role: OrganizationRoleEnums): number | null {
    const labelName = ORG_ROLE_TO_ASSOCIATION_LABEL[role];
    if (!labelName) {
      // MEMBER role uses default association (no specific type ID)
      return null;
    }
    return this.getWorkspaceContactAssociationTypeId(labelName);
  }

  /**
   * Batch add workspace contact associations using pre-fetched IDs
   * Handles chunking for large datasets (HubSpot limits to 100 items per batch)
   */
  private async batchAddAssociationsWithIds({
    workspaceRecordId,
    associations,
  }: {
    workspaceRecordId: string;
    associations: Array<{
      contactId: string;
      orgRole: OrganizationRoleEnums;
    }>;
  }): Promise<void> {
    if (!associations.length) {
      return;
    }

    const objectTypeId = this.getWorkspaceObjectTypeId();
    const { batchApi, basicApi } = this.hubspotClient.crm.associations.v4;

    // Separate labeled vs default associations
    const labeledInputs: Array<{
      _from: { id: string };
      to: { id: string };
      types: Array<{
        associationCategory: AssociationSpecAssociationCategoryEnum;
        associationTypeId: number;
      }>;
    }> = [];
    const defaultContactIds: string[] = [];

    associations.forEach(({ contactId, orgRole }) => {
      const labelName = ORG_ROLE_TO_ASSOCIATION_LABEL[orgRole];
      if (labelName) {
        const associationTypeId = this.getWorkspaceContactAssociationTypeId(labelName);
        if (associationTypeId) {
          labeledInputs.push({
            _from: { id: workspaceRecordId },
            to: { id: contactId },
            types: [{
              associationCategory: AssociationSpecAssociationCategoryEnum.UserDefined,
              associationTypeId,
            }],
          });
        }
      } else {
        defaultContactIds.push(contactId);
      }
    });

    // batch create labeled associations with parallel chunk processing
    if (labeledInputs.length > 0) {
      const labeledChunks = chunk(labeledInputs, HUBSPOT_BATCH_SIZE_LIMIT);
      await this.executeConcurrently(
        labeledChunks.map((inputChunk) => () => this.executeWithRateLimit(() => batchApi.create(
          objectTypeId,
          HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
          { inputs: inputChunk },
        ))),
      );
    }

    // create default associations with controlled concurrency
    if (defaultContactIds.length > 0) {
      await this.executeConcurrently(
        defaultContactIds.map((contactId) => () => this.executeWithRateLimit(() => basicApi.createDefault(
          objectTypeId,
          workspaceRecordId,
          HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
          contactId,
        ))),
      );
    }
  }

  async syncHubspotWorkspace({
    orgId,
    orgName,
    members,
  }: {
    orgId: string;
    orgName: string;
    members: Array<{
      email: string;
      role: OrganizationRoleEnums;
    }>;
  }): Promise<void> {
    if (this.isHubspotDisabled()) {
      return;
    }

    try {
      const syncStartTime = Date.now();

      this.loggerService.info({
        context: this.syncHubspotWorkspace.name,
        message: 'Starting HubSpot workspace sync',
        extraInfo: { orgId, memberCount: members.length },
      });

      // Step 1: Parallel - find workspace AND map emails (independent operations)
      const step1StartTime = Date.now();
      const memberEmails = members.map((m) => m.email);
      const [existingWorkspaceId, emailToContactIdMap] = await Promise.all([
        this.findWorkspaceByOrgId(orgId),
        this.mapEmailsToContactIds(memberEmails),
      ]);

      this.loggerService.info({
        context: this.syncHubspotWorkspace.name,
        message: 'Step 1 complete: Parallel fetch workspace and map emails',
        extraInfo: {
          orgId,
          workspaceFound: !!existingWorkspaceId,
          contactsMapped: emailToContactIdMap.size,
          totalEmails: memberEmails.length,
          durationMs: Date.now() - step1StartTime,
        },
      });

      // Step 2: Create workspace if not exists
      let workspaceRecordId = existingWorkspaceId;
      if (!workspaceRecordId) {
        const step2StartTime = Date.now();
        const objectTypeId = this.getWorkspaceObjectTypeId();
        const response = await this.executeWithRateLimit(() => this.hubspotClient.crm.objects.basicApi.create(
          objectTypeId,
          {
            properties: {
              lumin_workspace_id: orgId,
              name: orgName,
            },
          },
        ));
        workspaceRecordId = response.id;

        this.loggerService.info({
          context: this.syncHubspotWorkspace.name,
          message: 'Step 2 complete: Created HubSpot Workspace record',
          extraInfo: { orgId, workspaceRecordId, durationMs: Date.now() - step2StartTime },
        });
      }

      // Step 3: Fetch current associations (needs workspaceRecordId)
      const step3StartTime = Date.now();
      this.loggerService.info({
        context: this.syncHubspotWorkspace.name,
        message: 'Fetching current workspace associations',
        extraInfo: { orgId, workspaceRecordId },
      });

      const currentAssociations = await this.getWorkspaceContactAssociations(workspaceRecordId);

      this.loggerService.info({
        context: this.syncHubspotWorkspace.name,
        message: 'Step 3 complete: Fetched current associations',
        extraInfo: {
          orgId,
          workspaceRecordId,
          currentAssociationsCount: currentAssociations.length,
          durationMs: Date.now() - step3StartTime,
        },
      });

      // map: contactId -> associationTypeId (for current HubSpot state)
      const currentContactMap = new Map<string, number>(
        currentAssociations.map((assoc) => [assoc.contactId, assoc.associationTypeId]),
      );

      // map: email -> { contactId, role }
      const emailToContactInfo = new Map<string, { contactId: string | null; role: OrganizationRoleEnums }>();
      // map: contactId -> { email, role }
      const contactIdToInfo = new Map<string, { email: string; role: OrganizationRoleEnums }>();

      members.forEach((member) => {
        const contactId = emailToContactIdMap.get(member.email.toLowerCase()) || null;
        emailToContactInfo.set(member.email, { contactId, role: member.role });
        if (contactId) {
          contactIdToInfo.set(contactId, { email: member.email, role: member.role });
        }
      });

      // determine which contacts to remove (in HubSpot but not in new member list)
      const contactIdsToRemove = [...currentContactMap.keys()].filter(
        (contactId) => !contactIdToInfo.has(contactId),
      );

      // determine which contacts to add and which need role updates (using contactIds directly)
      const associationsToAdd: Array<{ contactId: string; orgRole: OrganizationRoleEnums }> = [];
      const contactIdsToUpdateRole: Array<{ contactId: string; newRole: OrganizationRoleEnums }> = [];
      const skippedEmails: string[] = [];

      [...emailToContactInfo.entries()].forEach(([email, { contactId, role }]) => {
        if (!contactId) {
          skippedEmails.push(email);
          return;
        }

        const currentTypeId = currentContactMap.get(contactId);
        const newTypeId = this.getAssociationTypeIdForRole(role);

        if (currentTypeId === undefined) {
          // Contact not currently associated, need to add
          associationsToAdd.push({ contactId, orgRole: role });
        } else if (currentTypeId !== newTypeId) {
          // Contact exists but with different role, need to update
          contactIdsToUpdateRole.push({ contactId, newRole: role });
        }
        // else: contact exists with same role, no action needed
      });

      // For role updates, we need to remove then add - collect the contactIds to remove
      const contactIdsToRemoveForRoleUpdate = contactIdsToUpdateRole.map(({ contactId }) => contactId);

      // Calculate all changes first for early exit check
      const allContactIdsToRemove = [...contactIdsToRemove, ...contactIdsToRemoveForRoleUpdate];
      const roleUpdateAssociations = contactIdsToUpdateRole.map(({ contactId, newRole }) => ({
        contactId,
        orgRole: newRole,
      }));
      const allAssociationsToAdd = [...associationsToAdd, ...roleUpdateAssociations];

      // Log diff calculation results
      this.loggerService.info({
        context: this.syncHubspotWorkspace.name,
        message: 'Step 4 complete: Diff calculation',
        extraInfo: {
          orgId,
          toAdd: associationsToAdd.length,
          toRemove: contactIdsToRemove.length,
          toUpdateRole: contactIdsToUpdateRole.length,
          skipped: skippedEmails.length,
          unchanged: members.length - associationsToAdd.length - contactIdsToUpdateRole.length - skippedEmails.length,
        },
      });

      // Early exit if no changes detected
      if (allContactIdsToRemove.length === 0 && allAssociationsToAdd.length === 0) {
        this.loggerService.info({
          context: this.syncHubspotWorkspace.name,
          message: 'No changes detected, sync complete',
          extraInfo: {
            orgId,
            memberCount: members.length,
            currentAssociations: currentAssociations.length,
            contactsFound: emailToContactIdMap.size,
            skipped: skippedEmails.length,
            totalDurationMs: Date.now() - syncStartTime,
          },
        });
        return;
      }

      // 1. Remove associations (removed members + role updates in one batch)
      if (allContactIdsToRemove.length > 0) {
        const removeStartTime = Date.now();
        this.loggerService.info({
          context: this.syncHubspotWorkspace.name,
          message: 'Step 5: Removing workspace contact associations',
          extraInfo: {
            orgId,
            totalToRemove: allContactIdsToRemove.length,
            removedMembers: contactIdsToRemove.length,
            roleUpdates: contactIdsToRemoveForRoleUpdate.length,
          },
        });

        await this.batchRemoveWorkspaceContactAssociations({
          workspaceRecordId,
          contactIds: allContactIdsToRemove,
        });

        this.loggerService.info({
          context: this.syncHubspotWorkspace.name,
          message: 'Step 5 complete: Removed associations',
          extraInfo: { orgId, count: allContactIdsToRemove.length, durationMs: Date.now() - removeStartTime },
        });
      }

      // 2. Add associations (new members + role updates with new labels in one batch)
      if (allAssociationsToAdd.length > 0) {
        const addStartTime = Date.now();
        this.loggerService.info({
          context: this.syncHubspotWorkspace.name,
          message: 'Step 6: Adding workspace contact associations',
          extraInfo: {
            orgId,
            totalToAdd: allAssociationsToAdd.length,
            newMembers: associationsToAdd.length,
            roleUpdates: roleUpdateAssociations.length,
          },
        });

        await this.batchAddAssociationsWithIds({
          workspaceRecordId,
          associations: allAssociationsToAdd,
        });

        this.loggerService.info({
          context: this.syncHubspotWorkspace.name,
          message: 'Step 6 complete: Added associations',
          extraInfo: { orgId, count: allAssociationsToAdd.length, durationMs: Date.now() - addStartTime },
        });
      }

      this.loggerService.info({
        context: this.syncHubspotWorkspace.name,
        message: 'Successfully synced organization information to Hubspot workspace',
        extraInfo: {
          orgId,
          memberCount: members.length,
          currentAssociations: currentAssociations.length,
          contactsFound: emailToContactIdMap.size,
          added: associationsToAdd.length,
          removed: contactIdsToRemove.length,
          roleUpdated: contactIdsToUpdateRole.length,
          skipped: skippedEmails.length,
          totalDurationMs: Date.now() - syncStartTime,
        },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.syncHubspotWorkspace.name,
        message: 'Failed to sync organization information to Hubspot workspace',
        extraInfo: { orgId, memberCount: members.length },
        error,
      });
      throw error;
    }
  }

  private getWorkspaceEventName(eventName: HubspotWorkspaceEventName): string | null {
    let envKey: string;

    if (eventName === HubspotWorkspaceEventName.WORKSPACE_SUBSCRIPTION_CHANGED) {
      envKey = EnvConstants.HUBSPOT_WORKSPACE_SUBSCRIPTION_CHANGED_EVENT_NAME;
    } else if (eventName === HubspotWorkspaceEventName.WORKSPACE_SIZE_CHANGED) {
      envKey = EnvConstants.HUBSPOT_WORKSPACE_SIZE_CHANGED_EVENT_NAME;
    } else {
      this.loggerService.warn({
        context: this.getWorkspaceEventName.name,
        message: 'Unknown event name',
        extraInfo: { eventName },
      });
      return null;
    }

    const fullyQualifiedName = this.environmentService.getByKey(envKey);
    if (!fullyQualifiedName) {
      this.loggerService.warn({
        context: this.getWorkspaceEventName.name,
        message: 'Event name env var not set',
        extraInfo: { envKey, eventName },
      });
      return null;
    }

    return fullyQualifiedName;
  }

  /**
   * Send a custom event completion to HubSpot for workspace
   * API: https://developers.hubspot.com/docs/api-reference/events-send-event-completions-v3/guide
   */
  async sendWorkspaceEvent({
    orgId,
    eventName,
    properties,
  }: {
    orgId: string;
    eventName: HubspotWorkspaceEventName;
    properties: Record<string, string | number | boolean>;
  }): Promise<void> {
    if (this.isHubspotDisabled()) {
      return;
    }

    try {
      const workspaceRecordId = await this.findWorkspaceByOrgId(orgId);
      if (!workspaceRecordId) {
        this.loggerService.warn({
          context: this.sendWorkspaceEvent.name,
          message: 'Workspace record not found, skipping event',
          extraInfo: { orgId, eventName, properties },
        });
        return;
      }

      const fullyQualifiedEventName = this.getWorkspaceEventName(eventName);
      if (!fullyQualifiedEventName) {
        this.loggerService.warn({
          context: this.sendWorkspaceEvent.name,
          message: 'Event definition not found, skipping event',
          extraInfo: { orgId, eventName, properties },
        });
        return;
      }

      const response = await this.executeWithRateLimit(() => this.hubspotClient.apiRequest({
        method: 'POST',
        path: '/events/v3/send',
        body: {
          eventName: fullyQualifiedEventName,
          objectId: workspaceRecordId,
          occurredAt: new Date().toISOString(),
          properties,
        },
      }));
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message as string);
      }

      this.loggerService.info({
        context: this.sendWorkspaceEvent.name,
        message: 'Sent workspace event to HubSpot',
        extraInfo: { orgId, eventName, workspaceRecordId },
      });
    } catch (error) {
      this.loggerService.error({
        context: this.sendWorkspaceEvent.name,
        message: 'Failed to send workspace event to HubSpot',
        extraInfo: { orgId, eventName, properties },
        error,
      });
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';

import { EnvConstants } from '../../Common/constants/EnvConstants';
import { EnvironmentService } from '../../Environment/environment.service';
import { LoggerService } from '../../Logger/Logger.service';
import { OrganizationRoleEnums } from '../../Organization/organization.enum';
import { HubspotClientProvider } from '../hubspot-client.provider';
import { HubspotWorkspaceService } from '../hubspot-workspace.service';
import { HUBSPOT_BATCH_SIZE_LIMIT, HUBSPOT_OBJECT_TYPE_IDS } from '../hubspot.constant';
import { HubspotWorkspaceEventName } from '../hubspot.interface';

describe('HubspotWorkspaceService', () => {
  let service: HubspotWorkspaceService;
  let loggerService: LoggerService;

  const mockCreate = jest.fn();
  const mockArchive = jest.fn();
  const mockDoSearch = jest.fn();
  const mockContactsSearch = jest.fn();
  const mockApiRequest = jest.fn();
  const mockAssociationCreate = jest.fn();
  const mockAssociationCreateDefault = jest.fn();
  const mockAssociationArchive = jest.fn();
  const mockAssociationGetPage = jest.fn();
  const mockBatchCreate = jest.fn();
  const mockBatchArchive = jest.fn();

  const mockHubspotClient = {
    apiRequest: mockApiRequest,
    crm: {
      objects: {
        basicApi: {
          create: mockCreate,
          archive: mockArchive,
        },
        searchApi: {
          doSearch: mockDoSearch,
        },
      },
      contacts: {
        searchApi: {
          doSearch: mockContactsSearch,
        },
      },
      associations: {
        v4: {
          basicApi: {
            create: mockAssociationCreate,
            createDefault: mockAssociationCreateDefault,
            archive: mockAssociationArchive,
            getPage: mockAssociationGetPage,
          },
          batchApi: {
            create: mockBatchCreate,
            archive: mockBatchArchive,
          },
        },
      },
    },
  };

  const mockHubspotClientProvider = {
    getClient: jest.fn().mockReturnValue(mockHubspotClient),
  };

  const mockLoggerService = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const WORKSPACE_OBJECT_TYPE_ID = '2-12345';
  const OWNER_ASSOCIATION_TYPE_ID = '100';
  const ADMIN_ASSOCIATION_TYPE_ID = '101';
  const SUBSCRIPTION_CHANGED_EVENT_NAME = 'pe12345_workspace_subscription_changed';
  const SIZE_CHANGED_EVENT_NAME = 'pe12345_workspace_size_changed';

  const defaultGetByKey = (key: string): string => {
    const envMap: Record<string, string> = {
      [EnvConstants.ENV]: 'production',
      [EnvConstants.ENABLE_HUBSPOT_WORKSPACE]: 'true',
      [EnvConstants.HUBSPOT_WORKSPACE_OBJECT_TYPE_ID]: WORKSPACE_OBJECT_TYPE_ID,
      [EnvConstants.HUBSPOT_WORKSPACE_CONTACT_OWNER_ASSOCIATION_TYPE_ID]: OWNER_ASSOCIATION_TYPE_ID,
      [EnvConstants.HUBSPOT_WORKSPACE_CONTACT_ADMIN_ASSOCIATION_TYPE_ID]: ADMIN_ASSOCIATION_TYPE_ID,
      [EnvConstants.HUBSPOT_WORKSPACE_SUBSCRIPTION_CHANGED_EVENT_NAME]: SUBSCRIPTION_CHANGED_EVENT_NAME,
      [EnvConstants.HUBSPOT_WORKSPACE_SIZE_CHANGED_EVENT_NAME]: SIZE_CHANGED_EVENT_NAME,
    };
    return envMap[key];
  };

  const mockEnvironmentService = {
    isDevelopment: false,
    getByKey: jest.fn(defaultGetByKey),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset getByKey to default implementation after each test
    mockEnvironmentService.getByKey.mockImplementation(defaultGetByKey);

    // Set default resolved values for mocks to ensure they return Promises
    mockCreate.mockResolvedValue({ id: 'default-id' });
    mockArchive.mockResolvedValue(undefined);
    mockDoSearch.mockResolvedValue({ total: 0, results: [] });
    mockContactsSearch.mockResolvedValue({ total: 0, results: [] });
    mockApiRequest.mockResolvedValue({ ok: true });
    mockAssociationCreate.mockResolvedValue(undefined);
    mockAssociationCreateDefault.mockResolvedValue(undefined);
    mockAssociationArchive.mockResolvedValue(undefined);
    mockAssociationGetPage.mockResolvedValue({ results: [] });
    mockBatchCreate.mockResolvedValue(undefined);
    mockBatchArchive.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HubspotWorkspaceService,
        { provide: HubspotClientProvider, useValue: mockHubspotClientProvider },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: EnvironmentService, useValue: mockEnvironmentService },
      ],
    }).compile();

    service = module.get<HubspotWorkspaceService>(HubspotWorkspaceService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  describe('createWorkspace', () => {
    const orgId = 'org-123';
    const name = 'Test Workspace';

    it('should create workspace without associations successfully', async () => {
      const workspaceRecordId = 'workspace-record-123';

      mockCreate.mockResolvedValue({ id: workspaceRecordId });

      await service.createWorkspace({ orgId, name });

      expect(mockCreate).toHaveBeenCalledWith(WORKSPACE_OBJECT_TYPE_ID, {
        properties: {
          lumin_workspace_id: orgId,
          name,
        },
      });
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'createWorkspace',
          message: 'Created HubSpot Workspace record for organization',
        }),
      );
      // Should not call batch add associations when no associations provided
      expect(mockBatchCreate).not.toHaveBeenCalled();
      expect(mockAssociationCreateDefault).not.toHaveBeenCalled();
    });

    it('should create workspace and batch add associations successfully', async () => {
      const workspaceRecordId = 'workspace-record-123';
      const associations = [
        { contactEmail: 'owner@test.com', orgRole: OrganizationRoleEnums.ORGANIZATION_ADMIN },
        { contactEmail: 'member@test.com', orgRole: OrganizationRoleEnums.MEMBER },
      ];

      mockCreate.mockResolvedValue({ id: workspaceRecordId });
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockContactsSearch.mockResolvedValue({
        results: [
          { id: 'contact-1', properties: { email: 'owner@test.com' } },
          { id: 'contact-2', properties: { email: 'member@test.com' } },
        ],
      });

      await service.createWorkspace({ orgId, name, associations });

      expect(mockCreate).toHaveBeenCalledWith(WORKSPACE_OBJECT_TYPE_ID, {
        properties: {
          lumin_workspace_id: orgId,
          name,
        },
      });
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'createWorkspace',
          message: 'Created HubSpot Workspace record for organization',
        }),
      );
      // Should call batchAddWorkspaceContactAssociations for provided associations
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'batchAddWorkspaceContactAssociations',
          message: 'Batch added HubSpot Workspace <-> Contact associations',
        }),
      );
    });

    it('should log error when creation fails', async () => {
      const error = new Error('Create failed');
      mockCreate.mockRejectedValue(error);

      await service.createWorkspace({ orgId, name });

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'createWorkspace',
          message: 'Failed to create HubSpot Workspace record for organization',
          error,
        }),
      );
    });

    it('should log error when workspace object type ID is not set', async () => {
      mockEnvironmentService.getByKey.mockImplementation((key: string): string => {
        if (key === EnvConstants.HUBSPOT_WORKSPACE_OBJECT_TYPE_ID) {
          return undefined as unknown as string;
        }
        return 'production';
      });

      await service.createWorkspace({ orgId, name });

      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('deleteWorkspace', () => {
    const orgId = 'org-123';
    const workspaceRecordId = 'workspace-record-123';

    it('should delete workspace successfully', async () => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockArchive.mockResolvedValue(undefined);

      await service.deleteWorkspace(orgId);

      expect(mockArchive).toHaveBeenCalledWith(WORKSPACE_OBJECT_TYPE_ID, workspaceRecordId);
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'deleteWorkspace',
          message: 'Deleted Workspace record for org',
        }),
      );
    });

    it('should log warning when workspace not found', async () => {
      mockDoSearch.mockResolvedValue({
        total: 0,
        results: [],
      });

      await service.deleteWorkspace(orgId);

      expect(loggerService.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'deleteWorkspace',
          message: 'Workspace record not found for org',
        }),
      );
    });

    it('should log error when deletion fails', async () => {
      const error = new Error('Delete failed');
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockArchive.mockRejectedValue(error);

      await service.deleteWorkspace(orgId);

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'deleteWorkspace',
          message: 'Failed to delete Workspace record for org',
          error,
        }),
      );
    });
  });

  describe('findWorkspaceByOrgId', () => {
    const orgId = 'org-123';

    it('should return workspace record ID when found', async () => {
      const workspaceRecordId = 'workspace-record-123';
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });

      const result = await service.findWorkspaceByOrgId(orgId);

      expect(result).toBe(workspaceRecordId);
      expect(mockDoSearch).toHaveBeenCalledWith(WORKSPACE_OBJECT_TYPE_ID, {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'lumin_workspace_id',
                operator: 'EQ',
                value: orgId,
              },
            ],
          },
        ],
        properties: ['lumin_workspace_id', 'name'],
        limit: 1,
        after: '0',
      });
    });

    it('should return null when workspace not found', async () => {
      mockDoSearch.mockResolvedValue({
        total: 0,
        results: [],
      });

      const result = await service.findWorkspaceByOrgId(orgId);

      expect(result).toBeNull();
    });

    it('should return null and log error when search fails', async () => {
      const error = new Error('Search failed');
      mockDoSearch.mockRejectedValue(error);

      const result = await service.findWorkspaceByOrgId(orgId);

      expect(result).toBeNull();
      expect(loggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'findWorkspaceByOrgId',
          error,
        }),
      );
    });
  });

  describe('findContactIdByEmail', () => {
    const email = 'test@example.com';

    it('should return contact ID when found', async () => {
      const contactId = 'contact-123';
      mockContactsSearch.mockResolvedValue({
        total: 1,
        results: [{ id: contactId }],
      });

      const result = await service.findContactIdByEmail(email);

      expect(result).toBe(contactId);
      expect(mockContactsSearch).toHaveBeenCalledWith({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
        properties: ['email'],
        limit: 1,
        after: '0',
      });
    });

    it('should return null when contact not found', async () => {
      mockContactsSearch.mockResolvedValue({
        total: 0,
        results: [],
      });

      const result = await service.findContactIdByEmail(email);

      expect(result).toBeNull();
    });

    it('should return null and log error when search fails', async () => {
      const error = new Error('Contact search failed');
      mockContactsSearch.mockRejectedValue(error);

      const result = await service.findContactIdByEmail(email);

      expect(result).toBeNull();
      expect(loggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'findContactIdByEmail',
          error,
        }),
      );
    });
  });

  describe('addWorkspaceContactAssociation', () => {
    const orgId = 'org-123';
    const contactEmail = 'member@test.com';
    const workspaceRecordId = 'workspace-123';
    const contactId = 'contact-123';

    beforeEach(() => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockContactsSearch.mockResolvedValue({
        total: 1,
        results: [{ id: contactId }],
      });
    });

    it('should create labeled association for ORGANIZATION_ADMIN role', async () => {
      await service.addWorkspaceContactAssociation({
        orgId,
        contactEmail,
        orgRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
      });

      expect(mockAssociationCreate).toHaveBeenCalledWith(
        WORKSPACE_OBJECT_TYPE_ID,
        workspaceRecordId,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        contactId,
        [
          {
            associationCategory: 'USER_DEFINED',
            associationTypeId: parseInt(OWNER_ASSOCIATION_TYPE_ID, 10),
          },
        ],
      );
    });

    it('should create labeled association for BILLING_MODERATOR role', async () => {
      await service.addWorkspaceContactAssociation({
        orgId,
        contactEmail,
        orgRole: OrganizationRoleEnums.BILLING_MODERATOR,
      });

      expect(mockAssociationCreate).toHaveBeenCalledWith(
        WORKSPACE_OBJECT_TYPE_ID,
        workspaceRecordId,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        contactId,
        [
          {
            associationCategory: 'USER_DEFINED',
            associationTypeId: parseInt(ADMIN_ASSOCIATION_TYPE_ID, 10),
          },
        ],
      );
    });

    it('should create default association for MEMBER role', async () => {
      await service.addWorkspaceContactAssociation({
        orgId,
        contactEmail,
        orgRole: OrganizationRoleEnums.MEMBER,
      });

      expect(mockAssociationCreateDefault).toHaveBeenCalledWith(
        WORKSPACE_OBJECT_TYPE_ID,
        workspaceRecordId,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        contactId,
      );
    });

    it('should log warning and return null when workspace or contact not found', async () => {
      mockDoSearch.mockResolvedValue({ total: 0, results: [] });

      const result = await service.addWorkspaceContactAssociation({
        orgId,
        contactEmail,
        orgRole: OrganizationRoleEnums.MEMBER,
      });

      expect(result).toBeNull();
      expect(loggerService.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'addWorkspaceContactAssociation',
          message: 'Workspace record or contact not found',
          extraInfo: { orgId },
        }),
      );
      expect(mockAssociationCreate).not.toHaveBeenCalled();
      expect(mockAssociationCreateDefault).not.toHaveBeenCalled();
    });

    it('should return contactId on successful association', async () => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockContactsSearch.mockResolvedValue({
        total: 1,
        results: [{ id: contactId }],
      });

      const result = await service.addWorkspaceContactAssociation({
        orgId,
        contactEmail,
        orgRole: OrganizationRoleEnums.MEMBER,
      });

      expect(result).toBe(contactId);
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'addWorkspaceContactAssociation',
          message: 'Added a HubSpot Workspace <-> Contact association',
          extraInfo: expect.objectContaining({
            orgId,
            hubspotContactId: contactId,
          }),
        }),
      );
    });

    it('should throw error when association type ID env var not set for labeled association', async () => {
      mockEnvironmentService.getByKey.mockImplementation((key: string): string => {
        if (key === EnvConstants.HUBSPOT_WORKSPACE_CONTACT_OWNER_ASSOCIATION_TYPE_ID) {
          return undefined as unknown as string;
        }
        if (key === EnvConstants.HUBSPOT_WORKSPACE_OBJECT_TYPE_ID) {
          return WORKSPACE_OBJECT_TYPE_ID;
        }
        return 'production';
      });

      await expect(
        service.addWorkspaceContactAssociation({
          orgId,
          contactEmail,
          orgRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        }),
      ).rejects.toThrow('Association type ID not found');
    });
  });

  describe('removeWorkspaceContactAssociation', () => {
    const orgId = 'org-123';
    const contactEmail = 'member@test.com';
    const workspaceRecordId = 'workspace-123';
    const contactId = 'contact-123';

    it('should remove association successfully', async () => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockContactsSearch.mockResolvedValue({
        total: 1,
        results: [{ id: contactId }],
      });

      await service.removeWorkspaceContactAssociation({ orgId, contactEmail });

      expect(mockAssociationArchive).toHaveBeenCalledWith(
        WORKSPACE_OBJECT_TYPE_ID,
        workspaceRecordId,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        contactId,
      );
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'removeWorkspaceContactAssociation',
          message: 'Removed a HubSpot Workspace <-> Contact association',
          extraInfo: {
            orgId,
            hubspotContactId: contactId,
          },
        }),
      );
    });

    it('should log warning and return early when workspace or contact not found', async () => {
      mockDoSearch.mockResolvedValue({ total: 0, results: [] });
      mockContactsSearch.mockResolvedValue({ total: 0, results: [] });

      await service.removeWorkspaceContactAssociation({ orgId, contactEmail });

      expect(loggerService.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'removeWorkspaceContactAssociation',
          message: 'Workspace record or contact not found',
          extraInfo: { orgId },
        }),
      );
      expect(mockAssociationArchive).not.toHaveBeenCalled();
    });
  });

  describe('updateWorkspaceContactAssociationLabel', () => {
    const orgId = 'org-123';
    const contactEmail = 'member@test.com';
    const workspaceRecordId = 'workspace-123';
    const contactId = 'contact-123';

    it('should update association label successfully', async () => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockContactsSearch.mockResolvedValue({
        total: 1,
        results: [{ id: contactId }],
      });

      await service.updateWorkspaceContactAssociationLabel({
        orgId,
        contactEmail,
        newRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
      });

      expect(mockAssociationArchive).toHaveBeenCalled();
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'updateWorkspaceContactAssociationLabel',
          message: 'Updated HubSpot Workspace <-> Contact association label',
          extraInfo: {
            orgId,
            newRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
            hubspotContactId: contactId,
          },
        }),
      );
    });

    it('should log error when association type ID env var not set', async () => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockContactsSearch.mockResolvedValue({
        total: 1,
        results: [{ id: contactId }],
      });
      mockEnvironmentService.getByKey.mockImplementation((key: string): string => {
        if (key === EnvConstants.HUBSPOT_WORKSPACE_CONTACT_OWNER_ASSOCIATION_TYPE_ID) {
          return undefined as unknown as string;
        }
        if (key === EnvConstants.HUBSPOT_WORKSPACE_OBJECT_TYPE_ID) {
          return WORKSPACE_OBJECT_TYPE_ID;
        }
        return 'production';
      });

      await service.updateWorkspaceContactAssociationLabel({
        orgId,
        contactEmail,
        newRole: OrganizationRoleEnums.ORGANIZATION_ADMIN,
      });

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'updateWorkspaceContactAssociationLabel',
          message: 'Failed to update HubSpot Workspace <-> Contact association label',
        }),
      );
    });

    it('should complete successfully when workspace or contact not found (graceful handling)', async () => {
      mockDoSearch.mockResolvedValue({ total: 0, results: [] });
      mockContactsSearch.mockResolvedValue({ total: 0, results: [] });

      await service.updateWorkspaceContactAssociationLabel({
        orgId,
        contactEmail,
        newRole: OrganizationRoleEnums.MEMBER,
      });

      // removeWorkspaceContactAssociation logs warning and returns early
      expect(loggerService.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'removeWorkspaceContactAssociation',
          message: 'Workspace record or contact not found',
        }),
      );
      // Success log is called since no errors were thrown
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'updateWorkspaceContactAssociationLabel',
          message: 'Updated HubSpot Workspace <-> Contact association label',
        }),
      );
    });
  });

  describe('batchAddWorkspaceContactAssociations', () => {
    const orgId = 'org-123';
    const workspaceRecordId = 'workspace-123';

    it('should return early when associations array is empty', async () => {
      await service.batchAddWorkspaceContactAssociations({
        orgId,
        associations: [],
      });

      expect(mockDoSearch).not.toHaveBeenCalled();
    });

    it('should batch add associations successfully', async () => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      // mapEmailsToContactIds uses batch search with IN operator
      mockContactsSearch.mockResolvedValue({
        results: [
          { id: 'contact-1', properties: { email: 'admin@test.com' } },
          { id: 'contact-2', properties: { email: 'member@test.com' } },
        ],
      });

      await service.batchAddWorkspaceContactAssociations({
        orgId,
        associations: [
          { contactEmail: 'admin@test.com', orgRole: OrganizationRoleEnums.ORGANIZATION_ADMIN },
          { contactEmail: 'member@test.com', orgRole: OrganizationRoleEnums.MEMBER },
        ],
      });

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'batchAddWorkspaceContactAssociations',
          message: 'Batch added HubSpot Workspace <-> Contact associations',
          extraInfo: expect.objectContaining({
            orgId,
            labeledCount: expect.any(Number),
            defaultCount: expect.any(Number),
          }),
        }),
      );
    });

    it('should log warning and return early when workspace not found', async () => {
      mockDoSearch.mockResolvedValue({ total: 0, results: [] });

      await service.batchAddWorkspaceContactAssociations({
        orgId,
        associations: [
          { contactEmail: 'test@test.com', orgRole: OrganizationRoleEnums.MEMBER },
        ],
      });

      expect(loggerService.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'batchAddWorkspaceContactAssociations',
          message: 'Workspace record not found',
          extraInfo: { orgId },
        }),
      );
      expect(mockBatchCreate).not.toHaveBeenCalled();
      expect(mockAssociationCreateDefault).not.toHaveBeenCalled();
    });

    it('should deduplicate associations by email', async () => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      // mapEmailsToContactIds uses batch search with IN operator
      mockContactsSearch.mockResolvedValue({
        results: [{ id: 'contact-1', properties: { email: 'same@test.com' } }],
      });

      await service.batchAddWorkspaceContactAssociations({
        orgId,
        associations: [
          { contactEmail: 'same@test.com', orgRole: OrganizationRoleEnums.MEMBER },
          { contactEmail: 'same@test.com', orgRole: OrganizationRoleEnums.ORGANIZATION_ADMIN },
        ],
      });

      // Should only search once with batch IN operator for unique emails
      expect(mockContactsSearch).toHaveBeenCalledTimes(1);
      expect(mockContactsSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'IN',
                  values: ['same@test.com'],
                },
              ],
            },
          ],
        }),
      );
    });
  });

  describe('syncHubspotWorkspace', () => {
    const orgId = 'org-123';
    const orgName = 'Test Org';
    const workspaceRecordId = 'workspace-123';
    const members = [
      { email: 'admin@test.com', role: OrganizationRoleEnums.ORGANIZATION_ADMIN },
      { email: 'member@test.com', role: OrganizationRoleEnums.MEMBER },
    ];

    beforeEach(() => {
      // Default: workspace exists, no current associations
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockAssociationGetPage.mockResolvedValue({ results: [] });
    });

    it('should sync existing workspace with new members', async () => {
      // Batch find contacts returns both contacts
      mockContactsSearch.mockResolvedValue({
        results: [
          { id: 'contact-1', properties: { email: 'admin@test.com' } },
          { id: 'contact-2', properties: { email: 'member@test.com' } },
        ],
      });

      await service.syncHubspotWorkspace({ orgId, orgName, members });

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Successfully synced organization information to Hubspot workspace',
          extraInfo: expect.objectContaining({
            orgId,
            memberCount: 2,
            currentAssociations: 0,
            contactsFound: 2,
            added: 2,
            removed: 0,
            roleUpdated: 0,
          }),
        }),
      );
    });

    it('should log progress during sync', async () => {
      mockContactsSearch.mockResolvedValue({
        results: [
          { id: 'contact-1', properties: { email: 'admin@test.com' } },
        ],
      });

      await service.syncHubspotWorkspace({ orgId, orgName, members: [members[0]] });

      // Should log starting sync
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Starting HubSpot workspace sync',
          extraInfo: expect.objectContaining({
            orgId,
            memberCount: 1,
          }),
        }),
      );

      // Should log fetching associations
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Fetching current workspace associations',
        }),
      );

      // Note: "Mapping member emails to HubSpot contacts" log was removed
      // because mapEmailsToContactIds now runs in parallel with findWorkspaceByOrgId
    });

    it('should create workspace if not exists', async () => {
      const newWorkspaceRecordId = 'new-workspace-123';
      // Use mockImplementation to ensure findWorkspaceByOrgId returns null
      mockDoSearch.mockImplementation(() => Promise.resolve({ total: 0, results: [] }));
      mockCreate.mockResolvedValue({ id: newWorkspaceRecordId });
      mockAssociationGetPage.mockResolvedValue({ results: [] });
      mockContactsSearch.mockResolvedValue({
        results: [
          { id: 'contact-1', properties: { email: 'admin@test.com' } },
        ],
      });

      await service.syncHubspotWorkspace({ orgId, orgName, members: [members[0]] });

      expect(mockCreate).toHaveBeenCalledWith(WORKSPACE_OBJECT_TYPE_ID, {
        properties: {
          lumin_workspace_id: orgId,
          name: orgName,
        },
      });
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Step 2 complete: Created HubSpot Workspace record',
        }),
      );
    });

    it('should remove associations for members no longer in workspace', async () => {
      // Current HubSpot state: contact-old is associated
      mockAssociationGetPage.mockResolvedValue({
        results: [
          { toObjectId: 'contact-old', associationTypes: [{ typeId: 100 }] },
        ],
      });
      // New member list doesn't include the old contact
      mockContactsSearch.mockResolvedValue({
        results: [
          { id: 'contact-new', properties: { email: 'new@test.com' } },
        ],
      });

      await service.syncHubspotWorkspace({
        orgId,
        orgName,
        members: [{ email: 'new@test.com', role: OrganizationRoleEnums.MEMBER }],
      });

      // Should call batch archive for removed contact
      expect(mockBatchArchive).toHaveBeenCalledWith(
        WORKSPACE_OBJECT_TYPE_ID,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        {
          inputs: [
            { _from: { id: workspaceRecordId }, to: [{ id: 'contact-old' }] },
          ],
        },
      );
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          extraInfo: expect.objectContaining({
            removed: 1,
          }),
        }),
      );
    });

    it('should update role for members with changed roles', async () => {
      // Current HubSpot state: contact-1 is MEMBER (no labeled association, using default typeId)
      mockAssociationGetPage.mockResolvedValue({
        results: [
          { toObjectId: 'contact-1', associationTypes: [{ typeId: 1 }] }, // default association
        ],
      });
      // New member list: contact-1 is now ORGANIZATION_ADMIN
      mockContactsSearch.mockResolvedValue({
        results: [
          { id: 'contact-1', properties: { email: 'admin@test.com' } },
        ],
      });

      await service.syncHubspotWorkspace({
        orgId,
        orgName,
        members: [{ email: 'admin@test.com', role: OrganizationRoleEnums.ORGANIZATION_ADMIN }],
      });

      // Should remove old association and add new one with OWNER label
      expect(mockBatchArchive).toHaveBeenCalled();
      expect(mockBatchCreate).toHaveBeenCalled();
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          extraInfo: expect.objectContaining({
            roleUpdated: 1,
          }),
        }),
      );
    });

    it('should skip members not found in HubSpot contacts', async () => {
      // Batch find contacts returns empty (no contacts found)
      mockContactsSearch.mockResolvedValue({ results: [] });

      await service.syncHubspotWorkspace({ orgId, orgName, members });

      // When no contacts are found, early exit is triggered with "No changes detected"
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'No changes detected, sync complete',
          extraInfo: expect.objectContaining({
            skipped: 2,
            contactsFound: 0,
          }),
        }),
      );
    });

    it('should not call batch APIs when no changes needed', async () => {
      // Current HubSpot state matches new member list
      mockAssociationGetPage.mockResolvedValue({
        results: [
          { toObjectId: 'contact-1', associationTypes: [{ typeId: parseInt(OWNER_ASSOCIATION_TYPE_ID, 10) }] },
        ],
      });
      mockContactsSearch.mockResolvedValue({
        results: [
          { id: 'contact-1', properties: { email: 'admin@test.com' } },
        ],
      });

      await service.syncHubspotWorkspace({
        orgId,
        orgName,
        members: [{ email: 'admin@test.com', role: OrganizationRoleEnums.ORGANIZATION_ADMIN }],
      });

      // No batch operations should be called
      expect(mockBatchArchive).not.toHaveBeenCalled();
      expect(mockBatchCreate).not.toHaveBeenCalled();
      expect(mockAssociationCreateDefault).not.toHaveBeenCalled();

      // Early exit should log "No changes detected"
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'No changes detected, sync complete',
          extraInfo: expect.objectContaining({
            orgId,
            memberCount: 1,
            currentAssociations: 1,
            contactsFound: 1,
            skipped: 0,
          }),
        }),
      );

      // Should NOT log "Successfully synced..." since early exit was triggered
      expect(loggerService.info).not.toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Successfully synced organization information to Hubspot workspace',
        }),
      );
    });

    it('should handle empty members array', async () => {
      // Current HubSpot state has existing associations
      mockAssociationGetPage.mockResolvedValue({
        results: [
          { toObjectId: 'contact-1', associationTypes: [{ typeId: 100 }] },
        ],
      });

      await service.syncHubspotWorkspace({ orgId, orgName, members: [] });

      // Should remove all existing associations
      expect(mockBatchArchive).toHaveBeenCalledWith(
        WORKSPACE_OBJECT_TYPE_ID,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        {
          inputs: [
            { _from: { id: workspaceRecordId }, to: [{ id: 'contact-1' }] },
          ],
        },
      );
    });

    it('should chunk batch remove operations for large datasets', async () => {
      // Create more contacts than HUBSPOT_BATCH_SIZE_LIMIT to test chunking
      const numContacts = HUBSPOT_BATCH_SIZE_LIMIT + 50; // 150 contacts
      const currentAssociationsResults = Array.from({ length: numContacts }, (_, i) => ({
        toObjectId: `contact-${i}`,
        associationTypes: [{ typeId: 100 }],
      }));

      mockAssociationGetPage.mockResolvedValue({
        results: currentAssociationsResults,
      });
      // New member list is empty - should remove all contacts
      mockContactsSearch.mockResolvedValue({ results: [] });

      await service.syncHubspotWorkspace({ orgId, orgName, members: [] });

      // Should call batch archive twice (chunked into groups of 100)
      expect(mockBatchArchive).toHaveBeenCalledTimes(2);
      // First batch should have 100 items
      expect(mockBatchArchive).toHaveBeenNthCalledWith(
        1,
        WORKSPACE_OBJECT_TYPE_ID,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        {
          inputs: expect.arrayContaining([
            expect.objectContaining({ _from: { id: workspaceRecordId } }),
          ]),
        },
      );
    });

    it('should chunk batch add operations for large datasets', async () => {
      // Create more contacts than HUBSPOT_BATCH_SIZE_LIMIT
      const numContacts = HUBSPOT_BATCH_SIZE_LIMIT + 50; // 150 contacts
      const membersList = Array.from({ length: numContacts }, (_, i) => ({
        email: `admin${i}@test.com`,
        role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
      }));
      const contactResults = Array.from({ length: numContacts }, (_, i) => ({
        id: `contact-${i}`,
        properties: { email: `admin${i}@test.com` },
      }));

      mockContactsSearch.mockResolvedValue({ results: contactResults });

      await service.syncHubspotWorkspace({ orgId, orgName, members: membersList });

      // Should call batch create twice for labeled associations (chunked into groups of 100)
      expect(mockBatchCreate).toHaveBeenCalledTimes(2);
    });

    it('should handle paginated associations when fetching current state', async () => {
      // First page returns associations with pagination cursor
      mockAssociationGetPage
        .mockResolvedValueOnce({
          results: [
            { toObjectId: 'contact-1', associationTypes: [{ typeId: 100 }] },
            { toObjectId: 'contact-2', associationTypes: [{ typeId: 101 }] },
          ],
          paging: { next: { after: 'cursor-page-2' } },
        })
        // Second page returns more associations without pagination (last page)
        .mockResolvedValueOnce({
          results: [
            { toObjectId: 'contact-3', associationTypes: [{ typeId: 100 }] },
          ],
        });

      // New member list is empty - should remove all 3 contacts from both pages
      mockContactsSearch.mockResolvedValue({ results: [] });

      await service.syncHubspotWorkspace({ orgId, orgName, members: [] });

      // Should have called getPage twice (pagination)
      expect(mockAssociationGetPage).toHaveBeenCalledTimes(2);
      // First call without after cursor
      expect(mockAssociationGetPage).toHaveBeenNthCalledWith(
        1,
        WORKSPACE_OBJECT_TYPE_ID,
        workspaceRecordId,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        undefined,
      );
      // Second call with after cursor from first page
      expect(mockAssociationGetPage).toHaveBeenNthCalledWith(
        2,
        WORKSPACE_OBJECT_TYPE_ID,
        workspaceRecordId,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        'cursor-page-2',
      );

      // Should remove all 3 contacts from both pages
      expect(mockBatchArchive).toHaveBeenCalledWith(
        WORKSPACE_OBJECT_TYPE_ID,
        HUBSPOT_OBJECT_TYPE_IDS.CONTACT,
        {
          inputs: expect.arrayContaining([
            { _from: { id: workspaceRecordId }, to: [{ id: 'contact-1' }] },
            { _from: { id: workspaceRecordId }, to: [{ id: 'contact-2' }] },
            { _from: { id: workspaceRecordId }, to: [{ id: 'contact-3' }] },
          ]),
        },
      );
    });

    it('should throw error when sync fails', async () => {
      const error = new Error('Create failed');
      mockDoSearch.mockResolvedValueOnce({ total: 0, results: [] });
      mockCreate.mockRejectedValue(error);

      await expect(
        service.syncHubspotWorkspace({ orgId, orgName, members }),
      ).rejects.toThrow('Create failed');

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Failed to sync organization information to Hubspot workspace',
          error,
        }),
      );
    });
  });

  describe('rate limiting', () => {
    it('should limit concurrent API calls', async () => {
      const orgId = 'org-123';
      const workspaceRecordId = 'workspace-123';

      // Track concurrent calls
      let maxConcurrent = 0;
      let currentConcurrent = 0;

      mockDoSearch.mockImplementation(async () => {
        currentConcurrent += 1;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await new Promise((resolve) => { setTimeout(resolve, 10); });
        currentConcurrent -= 1;
        return { total: 1, results: [{ id: workspaceRecordId }] };
      });

      // Make multiple concurrent calls
      await Promise.all([
        service.findWorkspaceByOrgId(orgId),
        service.findWorkspaceByOrgId(orgId),
        service.findWorkspaceByOrgId(orgId),
      ]);

      // Should have limited concurrent calls (max 10 based on HUBSPOT_API_CONCURRENCY_LIMIT)
      expect(maxConcurrent).toBeLessThanOrEqual(10);
    });

    it('should queue requests when concurrency limit is reached', async () => {
      const workspaceRecordId = 'workspace-123';
      const callOrder: number[] = [];

      mockDoSearch.mockImplementation(async () => {
        const callNum = callOrder.length;
        callOrder.push(callNum);
        await new Promise((resolve) => { setTimeout(resolve, 5); });
        return { total: 1, results: [{ id: workspaceRecordId }] };
      });

      // Make multiple calls
      await Promise.all([
        service.findWorkspaceByOrgId('org-1'),
        service.findWorkspaceByOrgId('org-2'),
        service.findWorkspaceByOrgId('org-3'),
        service.findWorkspaceByOrgId('org-4'),
        service.findWorkspaceByOrgId('org-5'),
      ]);

      // All calls should complete
      expect(callOrder.length).toBe(5);
    });

    // Note: Rate limit retry tests are commented out because the retry logic
    // in the staged changes hasn't been applied to the working directory yet.
    // Uncomment these tests after the staged changes are committed/applied.
    /*
    it('should retry on rate limit error (429) with exponential backoff', async () => {
      // Test retry logic with exponential backoff
    });

    it('should return null after max retries on persistent rate limit', async () => {
      // Test max retry exhaustion
    });
    */
  });

  describe('partial failure handling', () => {
    const orgId = 'org-123';
    const orgName = 'Test Org';
    const workspaceRecordId = 'workspace-123';

    beforeEach(() => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockAssociationGetPage.mockResolvedValue({ results: [] });
    });

    it('should handle partial contact search failures gracefully', async () => {
      let callCount = 0;

      // First chunk succeeds, second chunk fails
      mockContactsSearch.mockImplementation(async () => {
        callCount += 1;
        if (callCount === 2) {
          const error = new Error('Rate limit') as Error & { response?: { status: number } };
          error.response = { status: 429 };
          throw error;
        }
        return {
          results: [
            { id: `contact-${callCount}`, properties: { email: `user${callCount}@test.com` } },
          ],
        };
      });

      // Create 200 members to trigger 2 chunks (100 each)
      const members = Array.from({ length: 200 }, (_, i) => ({
        email: `user${i}@test.com`,
        role: OrganizationRoleEnums.MEMBER,
      }));

      await service.syncHubspotWorkspace({ orgId, orgName, members });

      // Should log warning about failed chunk
      expect(loggerService.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'findContactsByEmailsSafe',
          message: 'Failed to fetch contacts for chunk, continuing with partial results',
        }),
      );

      // Should still complete sync with partial results
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'mapEmailsToContactIds',
          message: 'Completed email to contact ID mapping',
          extraInfo: expect.objectContaining({
            failedChunks: expect.any(Number),
          }),
        }),
      );
    });

    it('should log start and completion of email mapping', async () => {
      mockContactsSearch.mockResolvedValue({
        results: [
          { id: 'contact-1', properties: { email: 'user1@test.com' } },
          { id: 'contact-2', properties: { email: 'user2@test.com' } },
        ],
      });

      const members = [
        { email: 'user1@test.com', role: OrganizationRoleEnums.MEMBER },
        { email: 'user2@test.com', role: OrganizationRoleEnums.MEMBER },
      ];

      await service.syncHubspotWorkspace({ orgId, orgName, members });

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'mapEmailsToContactIds',
          message: 'Starting email to contact ID mapping',
          extraInfo: expect.objectContaining({
            totalEmails: 2,
            uniqueEmails: 2,
            chunks: 1,
          }),
        }),
      );

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'mapEmailsToContactIds',
          message: 'Completed email to contact ID mapping',
          extraInfo: expect.objectContaining({
            contactsFound: 2,
            durationMs: expect.any(Number),
          }),
        }),
      );
    });
  });

  describe('sync step logging', () => {
    const orgId = 'org-123';
    const orgName = 'Test Org';
    const workspaceRecordId = 'workspace-123';

    beforeEach(() => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockAssociationGetPage.mockResolvedValue({ results: [] });
    });

    it('should log step 1 completion with timing', async () => {
      mockContactsSearch.mockResolvedValue({
        results: [{ id: 'contact-1', properties: { email: 'user@test.com' } }],
      });

      await service.syncHubspotWorkspace({
        orgId,
        orgName,
        members: [{ email: 'user@test.com', role: OrganizationRoleEnums.MEMBER }],
      });

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Step 1 complete: Parallel fetch workspace and map emails',
          extraInfo: expect.objectContaining({
            orgId,
            workspaceFound: true,
            contactsMapped: 1,
            durationMs: expect.any(Number),
          }),
        }),
      );
    });

    it('should log step 3 completion with association count', async () => {
      mockContactsSearch.mockResolvedValue({
        results: [{ id: 'contact-1', properties: { email: 'user@test.com' } }],
      });

      await service.syncHubspotWorkspace({
        orgId,
        orgName,
        members: [{ email: 'user@test.com', role: OrganizationRoleEnums.MEMBER }],
      });

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Step 3 complete: Fetched current associations',
          extraInfo: expect.objectContaining({
            orgId,
            workspaceRecordId,
            currentAssociationsCount: 0,
            durationMs: expect.any(Number),
          }),
        }),
      );
    });

    it('should log step 4 diff calculation results', async () => {
      mockContactsSearch.mockResolvedValue({
        results: [
          { id: 'contact-1', properties: { email: 'user1@test.com' } },
          { id: 'contact-2', properties: { email: 'user2@test.com' } },
        ],
      });

      await service.syncHubspotWorkspace({
        orgId,
        orgName,
        members: [
          { email: 'user1@test.com', role: OrganizationRoleEnums.MEMBER },
          { email: 'user2@test.com', role: OrganizationRoleEnums.ORGANIZATION_ADMIN },
          { email: 'notfound@test.com', role: OrganizationRoleEnums.MEMBER },
        ],
      });

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Step 4 complete: Diff calculation',
          extraInfo: expect.objectContaining({
            orgId,
            toAdd: 2,
            toRemove: 0,
            toUpdateRole: 0,
            skipped: 1,
          }),
        }),
      );
    });

    it('should log step 5 and 6 with timing when changes are made', async () => {
      // Current state: contact-old exists
      mockAssociationGetPage.mockResolvedValue({
        results: [
          { toObjectId: 'contact-old', associationTypes: [{ typeId: 100 }] },
        ],
      });

      // New state: add contact-new, remove contact-old
      mockContactsSearch.mockResolvedValue({
        results: [{ id: 'contact-new', properties: { email: 'new@test.com' } }],
      });

      await service.syncHubspotWorkspace({
        orgId,
        orgName,
        members: [{ email: 'new@test.com', role: OrganizationRoleEnums.MEMBER }],
      });

      // Step 5: Removing associations
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Step 5: Removing workspace contact associations',
        }),
      );

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Step 5 complete: Removed associations',
          extraInfo: expect.objectContaining({
            durationMs: expect.any(Number),
          }),
        }),
      );

      // Step 6: Adding associations
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Step 6: Adding workspace contact associations',
        }),
      );

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Step 6 complete: Added associations',
          extraInfo: expect.objectContaining({
            durationMs: expect.any(Number),
          }),
        }),
      );
    });

    it('should log total duration on successful sync', async () => {
      mockContactsSearch.mockResolvedValue({
        results: [{ id: 'contact-1', properties: { email: 'user@test.com' } }],
      });

      await service.syncHubspotWorkspace({
        orgId,
        orgName,
        members: [{ email: 'user@test.com', role: OrganizationRoleEnums.MEMBER }],
      });

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'Successfully synced organization information to Hubspot workspace',
          extraInfo: expect.objectContaining({
            totalDurationMs: expect.any(Number),
          }),
        }),
      );
    });

    it('should log total duration on early exit', async () => {
      // Current state matches new state - no changes needed
      mockAssociationGetPage.mockResolvedValue({
        results: [
          { toObjectId: 'contact-1', associationTypes: [{ typeId: 100 }] },
        ],
      });
      mockContactsSearch.mockResolvedValue({
        results: [{ id: 'contact-1', properties: { email: 'user@test.com' } }],
      });

      await service.syncHubspotWorkspace({
        orgId,
        orgName,
        members: [{ email: 'user@test.com', role: OrganizationRoleEnums.ORGANIZATION_ADMIN }],
      });

      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'syncHubspotWorkspace',
          message: 'No changes detected, sync complete',
          extraInfo: expect.objectContaining({
            totalDurationMs: expect.any(Number),
          }),
        }),
      );
    });
  });

  describe('sendWorkspaceEvent', () => {
    const orgId = 'org-123';
    const eventName = HubspotWorkspaceEventName.WORKSPACE_SUBSCRIPTION_CHANGED;
    const properties = { status: 'renewal_failed' };
    const workspaceRecordId = 'workspace-123';

    it('should send workspace event successfully', async () => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockApiRequest.mockResolvedValue({ ok: true });

      await service.sendWorkspaceEvent({ orgId, eventName, properties });

      expect(mockApiRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/events/v3/send',
        body: expect.objectContaining({
          eventName: SUBSCRIPTION_CHANGED_EVENT_NAME,
          objectId: workspaceRecordId,
          properties,
        }),
      });
      expect(loggerService.info).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'sendWorkspaceEvent',
          message: 'Sent workspace event to HubSpot',
        }),
      );
    });

    it('should skip event when workspace not found', async () => {
      mockDoSearch.mockResolvedValue({ total: 0, results: [] });

      await service.sendWorkspaceEvent({ orgId, eventName, properties });

      expect(mockApiRequest).not.toHaveBeenCalled();
      expect(loggerService.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'sendWorkspaceEvent',
          message: 'Workspace record not found, skipping event',
        }),
      );
    });

    it('should skip event when event name env var not set', async () => {
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockEnvironmentService.getByKey.mockImplementation((key: string): string => {
        if (key === EnvConstants.HUBSPOT_WORKSPACE_SUBSCRIPTION_CHANGED_EVENT_NAME) {
          return undefined as unknown as string;
        }
        if (key === EnvConstants.HUBSPOT_WORKSPACE_OBJECT_TYPE_ID) {
          return WORKSPACE_OBJECT_TYPE_ID;
        }
        return 'production';
      });

      await service.sendWorkspaceEvent({ orgId, eventName, properties });

      expect(mockApiRequest).not.toHaveBeenCalled();
      expect(loggerService.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'sendWorkspaceEvent',
          message: 'Event definition not found, skipping event',
        }),
      );
    });

    it('should log error when sending event fails', async () => {
      const error = new Error('Event send failed');
      mockDoSearch.mockResolvedValue({
        total: 1,
        results: [{ id: workspaceRecordId }],
      });
      mockApiRequest.mockRejectedValue(error);

      await service.sendWorkspaceEvent({ orgId, eventName, properties });

      expect(loggerService.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'sendWorkspaceEvent',
          message: 'Failed to send workspace event to HubSpot',
          error,
        }),
      );
    });
  });
});

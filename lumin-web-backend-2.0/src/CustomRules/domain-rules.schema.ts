import { z } from 'zod';

import {
  ORG_ACCESS_SCOPE,
  MEMBERSHIP_SCOPE,
  FILE_SERVICE,
  FILE_SCOPE,
  INVITE_SCOPE,
  SEARCH_SCOPE,
  UPLOADABLE_SERVICES,
} from './domain-rules.constants';

const OrganizationRulesSchema = z
  .object({
    domainOrgId: z.string().optional(),
    requireDomainMembership: z.boolean().optional(),
    autoJoinDomainOrg: z.boolean().optional(),
    membershipScope: z.enum([MEMBERSHIP_SCOPE.INTERNAL_ONLY, MEMBERSHIP_SCOPE.ALL]).optional(),
    allowOrgCreation: z.boolean().optional(),
    orgAccessScope: z.enum([ORG_ACCESS_SCOPE.INTERNAL_ONLY, ORG_ACCESS_SCOPE.ALL]).optional(),
  })
  .optional();

const FileRulesSchema = z
  .object({
    service: z.enum([FILE_SERVICE.ONLY_DRIVE, FILE_SERVICE.ALL]).optional(),
    scope: z.enum([FILE_SCOPE.PERSONAL_ONLY, FILE_SCOPE.ALL]).optional(),
    allowIndexing: z.boolean().optional(),
    templateManagementEnabled: z.boolean().optional(),
    uploadableServices: z.union([
      z.enum([UPLOADABLE_SERVICES.ALL]),
      z.array(z.enum([UPLOADABLE_SERVICES.GOOGLE_DRIVE, UPLOADABLE_SERVICES.LUMIN])),
    ]).optional(),
  })
  .optional();

const CollaborationRulesSchema = z
  .object({
    inviteScope: z.enum([INVITE_SCOPE.INTERNAL_ONLY, INVITE_SCOPE.ALL]).optional(),
    searchScope: z.enum([SEARCH_SCOPE.INTERNAL_ONLY, SEARCH_SCOPE.ALL]).optional(),
  })
  .optional();

const ExternalRulesSchema = z
  .object({
    canSearch: z.boolean().optional(),
    canInvite: z.boolean().optional(),
    canShare: z.boolean().optional(),
    canJoinOrg: z.boolean().optional(),
    canRequestDocs: z.boolean().optional(),
  })
  .optional();

const UIRulesSchema = z
  .object({
    hidePromptDriveUsersBanner: z.boolean().optional(),
    hideAiChatbot: z.boolean().optional(),
  })
  .optional();

const UserRulesSchema = z
  .object({
    allowChangeEmail: z.boolean().optional(),
  })
  .optional();

const RuleSetSchema = z.object({
  organization: OrganizationRulesSchema,
  files: FileRulesSchema,
  collaboration: CollaborationRulesSchema,
  external: ExternalRulesSchema,
  ui: UIRulesSchema,
  user: UserRulesSchema,
});

const TenantRuleSchema = RuleSetSchema.extend({
  policy: z.string().optional(),
});

export const DomainRulesConfigSchema = z.object({
  defaults: RuleSetSchema.optional(),
  policies: z.record(z.string(), RuleSetSchema).optional(),
  tenants: z.record(z.string(), TenantRuleSchema).optional(),
});

export type RuleSet = z.infer<typeof RuleSetSchema>;
export type TenantRule = z.infer<typeof TenantRuleSchema>;
export type DomainRulesConfig = z.infer<typeof DomainRulesConfigSchema>;

import { TemplateRole } from 'Template/template.enum';
import { TemplateOwnerType } from 'graphql.schema';

export const TEMPLATE_OWNER_ROLE_MAPPING = {
  [TemplateOwnerType.PERSONAL]: TemplateRole.OWNER,
  [TemplateOwnerType.ORGANIZATION_TEAM]: TemplateRole.ORGANIZATION_TEAM,
  [TemplateOwnerType.ORGANIZATION]: TemplateRole.ORGANIZATION,
};

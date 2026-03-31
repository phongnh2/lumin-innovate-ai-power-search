import { TemplateOwnerType } from 'graphql.schema';

export enum CommunityTemplateStorageNamespace {
  COMMUNITY = 'COMMUNITY',
}

export type TemplateStorageNamespace = TemplateOwnerType | CommunityTemplateStorageNamespace;

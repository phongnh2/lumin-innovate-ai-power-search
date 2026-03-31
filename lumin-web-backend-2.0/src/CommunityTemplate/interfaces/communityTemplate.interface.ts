import {
  CommunityTemplateState,
  CommunityTemplateType,
  TemplateCounter,
  RateCommunityTemplate,
} from 'graphql.schema';

export interface IDraftTemplateModel {
  name?: string;
  url?: string;
  thumbnails?: string[];
  description?: string;
  categories?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface IDraftTemplate extends IDraftTemplateModel {}
export interface ICommunityTemplateModel {
  name: string;
  url: string;
  thumbnails: string[];
  description: string;
  categories: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  remoteId: string;
  ownerId: any;
  lastModifiedBy: any;
  publishDate: Date;
  status: CommunityTemplateState;
  type: CommunityTemplateType;
  counter: TemplateCounter;
  rateStar: RateCommunityTemplate;
  draftTemplate: IDraftTemplate;
  lastUpdate: Date;
}

export interface ICommunityTemplate extends ICommunityTemplateModel {
  _id: string;
}

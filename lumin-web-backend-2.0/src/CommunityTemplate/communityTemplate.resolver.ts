import {
  Resolver, Query, ResolveField, Parent, Args,
} from '@nestjs/graphql';

import { CommunityTemplateService } from 'CommunityTemplate/communityTemplate.service';
import { ICommunityTemplate } from 'CommunityTemplate/interfaces/communityTemplate.interface';
import {
  BasicUserInfo,
  CommunityTemplate,
  GetCommunityTemplatePayload,
  GetPublishedTemplatesInput,
  TemplateCategory,
} from 'graphql.schema';

@Resolver('CommunityTemplate')
export class CommunityTemplateResolver {
  constructor(
    private readonly communityTemplateService: CommunityTemplateService,
  ) {}

  @Query()
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    return this.communityTemplateService.findTemplateCategories();
  }

  @Query()
  async getPublishedTemplates(
    @Args('input') input: GetPublishedTemplatesInput,
  ): Promise<GetCommunityTemplatePayload> {
    const {
      templates,
      currentCategory,
      total,
    } = await this.communityTemplateService.getPublishedTemplates(input);

    return {
      templates,
      currentCategory,
      total,
    };
  }

  @Query()
  async getPublishedTemplateByUrl(
    @Args('url') url: string,
  ): Promise<CommunityTemplate> {
    const { template, error } = await this.communityTemplateService.getTemplateDetail({
      url,
    });

    if (error) {
      throw error;
    }
    return template;
  }

  @ResolveField('owner')
  getTemplateOwner(@Parent() template: CommunityTemplate & ICommunityTemplate): Promise<BasicUserInfo> {
    if (template.owner) {
      return Promise.resolve(template.owner);
    }
    return this.communityTemplateService.findTemplateUser(template, template.ownerId as string);
  }

  @ResolveField('lastModifier')
  getTemplateModifier(@Parent() template: CommunityTemplate & ICommunityTemplate): Promise<BasicUserInfo> {
    if (template.lastModifier) {
      return Promise.resolve(template.lastModifier);
    }
    return this.communityTemplateService.findTemplateUser(template, template.lastModifiedBy as string);
  }

  @ResolveField('hasDraft')
  hasDraft(@Parent() template: CommunityTemplate & ICommunityTemplate): boolean {
    return Boolean(template.draftTemplate);
  }

  @ResolveField('relatedTemplates')
  getRelatedTemplates(@Parent() template: CommunityTemplate): Promise<CommunityTemplate[]> {
    return this.communityTemplateService.getRelatedTemplatesByCategory(template);
  }
}

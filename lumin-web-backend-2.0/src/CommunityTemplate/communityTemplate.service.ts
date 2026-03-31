import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  isEmpty, difference, inRange, omitBy, isNil, merge, unset, get,
} from 'lodash';
import {
  FilterQuery,
  Model, PipelineStage, QueryOptions, Types, UpdateQuery,
} from 'mongoose';
import slugify from 'slugify';

import { SortStrategy } from 'Common/common.enum';
import {
  MIN_THUMBNAIL_OF_TEMPLATE,
  MAX_THUMBNAIL_OF_TEMPLATE,
  RELATED_COMMUNITY_TEMPLATE_NUMBER,
} from 'Common/constants/CommunityTemplateConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { FileData } from 'Common/validator/FileValidator/file.validator.pipe';

import { AwsService } from 'Aws/aws.service';

import { AdminService } from 'Admin/admin.service';
import { CommunityTemplateStorageNamespace } from 'CommunityTemplate/communityTemplate.enum';
import { ICommunityTemplate, ICommunityTemplateModel, IDraftTemplate } from 'CommunityTemplate/interfaces/communityTemplate.interface';
import { ITemplateCategory, ITemplateCategoryModel } from 'CommunityTemplate/interfaces/templateCategory.interface';
import { CommunityTemplateEventBuilder } from 'Event/builders/CommunityTemplateEventBuilder/communityTemplate.event.builder';
import { CommunityTemplateActionEvent, EventScopes, TemplateCategoryActionEvent } from 'Event/enums/event.enum';
import { AdminEventService } from 'Event/services/admin.event.service';
import {
  GetCommunityTemplatesInput,
  CommunityTemplateSearchQuery,
  CommunityTemplateFilterOptions,
  CommunityTemplateSearchField,
  CommunityTemplateSortOptions,
  CommunityTemplateType,
  CommunityTemplate,
  TemplateCategory,
  BasicUserInfo,
  DraftTemplateInput,
  GetPublishedTemplatesInput,
  CommunityTemplateState,
  AdminUploadTemplateInput,
  GetTemplateCategoryInput,
  GetTemplateCategoryPayload,
  TemplateCategorySortOptions,
  CommunityTemplateFilterStatus,
  Template,
} from 'graphql.schema';
import { UserService } from 'User/user.service';

@Injectable()
export class CommunityTemplateService {
  constructor(
    @InjectModel('CommunityTemplate') private readonly communityTemplateModel: Model<ICommunityTemplateModel>,
    @InjectModel('TemplateCategory') private readonly templateCategoryModel: Model<ITemplateCategoryModel>,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly eventService: AdminEventService,
    private readonly awsService: AwsService,
  ) {
  }

  private async create(data: ICommunityTemplate): Promise<ICommunityTemplate> {
    const communityTemplate = await this.communityTemplateModel.create(data);
    return { ...communityTemplate.toObject(), _id: communityTemplate._id.toHexString() };
  }

  private aggregateQuery(pipelines: PipelineStage[]): Promise<any> {
    return this.communityTemplateModel.aggregate(pipelines).exec();
  }

  async findOneById(templateId: string, projection?: Record<string, number>): Promise<ICommunityTemplate> {
    const communityTemplate = await this.communityTemplateModel.findOne({
      _id: templateId,
    }, projection).exec();
    return communityTemplate ? { ...communityTemplate.toObject(), _id: communityTemplate._id.toHexString() } : null;
  }

  private async updateOne(templateId: string, updateObject: FilterQuery<ICommunityTemplate>, options?: QueryOptions): Promise<ICommunityTemplate> {
    const communityTemplate = await this.communityTemplateModel.findOneAndUpdate({
      _id: templateId,
    }, updateObject, options).exec();
    return communityTemplate ? { ...communityTemplate.toObject(), _id: communityTemplate._id.toHexString() } : null;
  }

  private async deleteOne(templateId: string, options?: QueryOptions<ICommunityTemplate>): Promise<ICommunityTemplate> {
    const deletedTemplate = await this.communityTemplateModel.findOneAndDelete({ _id: templateId }, options).exec();
    return deletedTemplate ? { ...deletedTemplate.toObject(), _id: deletedTemplate._id.toHexString() } : null;
  }

  private sortOptionsMapping(sortOptions: CommunityTemplateSortOptions | TemplateCategorySortOptions): Record<string, SortStrategy> {
    return Object.entries(sortOptions).reduce((prevValue, [key, value]) => ({
      ...prevValue,
      [key]: SortStrategy[value as string],
    }), {});
  }

  async findTemplateCategory(conditions: FilterQuery<ITemplateCategory> = {}): Promise<ITemplateCategory> {
    const category = await this.templateCategoryModel.findOne(conditions).exec();
    return category ? { ...category.toObject(), _id: category._id.toHexString() } : null;
  }

  async findTemplateCategories(conditions: FilterQuery<ITemplateCategory> = {}): Promise<ITemplateCategory[]> {
    const templatecategories = await this.templateCategoryModel.find(conditions).exec();
    return templatecategories.map((category) => ({ ...category.toObject(), _id: category._id.toHexString() }));
  }

  async createTemplateCategory(data: Record<string, any>): Promise<{
    error?: GraphErrorException,
    category?: TemplateCategory,
  }> {
    const {
      name,
      creator,
    } = data;
    const existedCategory = await this.findTemplateCategory({ name });
    if (existedCategory) {
      return {
        error: GraphErrorException.Conflict('Category name has already existed', ErrorCode.TemplateCategory.CATEGORY_NAME_HAS_EXISTED),
      };
    }
    const [category, admin] = await Promise.all([
      this.templateCategoryModel.create(data),
      this.adminService.findById(creator as string),
    ]);
    const {
      _id, name: adminName, avatarRemoteId, email,
    } = admin;
    const eventData = new CommunityTemplateEventBuilder()
      .setActor({
        _id,
        name: adminName,
        avatarRemoteId,
        email,
      })
      .setTargetTemplate({
        _id: category._id.toHexString(),
        name,
      })
      .setScope([EventScopes.ADMIN])
      .setName(TemplateCategoryActionEvent.CATEGORY_CREATED)
      .build();
    this.eventService.createEvent(eventData);

    return {
      category: { ...category.toObject(), _id: category._id.toHexString() },
    };
  }

  async validateAllCategoriesExistence(categoryIds: string[]): Promise<boolean> {
    const categories = await this.findTemplateCategories({
      _id: categoryIds,
    });

    return categories.length === categoryIds.length;
  }

  private mergeDraftTemplateObject(currentDraft): Record<string, any> {
    return Object
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .entries(currentDraft)
      .reduce((acc, [key, value]) => {
        acc[`draftTemplate.${key}`] = value;
        return acc;
      }, {});
  }

  async isExistUrl(url: string, excludeIds: string[] = []): Promise<boolean> {
    const andConditions = [
      Boolean(excludeIds.length) && {
        _id: {
          $nin: excludeIds.map((id) => new Types.ObjectId(id)),
        },
      },
      {
        $or: [
          {
            url,
          },
          {
            'draftTemplate.url': url,
          },
        ],
      },
    ].filter(Boolean);
    const isExistTemplate = await this.communityTemplateModel.exists({
      $and: andConditions,
    });
    return Boolean(isExistTemplate);
  }

  async findTemplateUser(template: ICommunityTemplate, userId: string): Promise<BasicUserInfo> {
    if (template.type === CommunityTemplateType.SYSTEM) {
      const admin = await this.adminService.findById(userId, {
        _id: 1,
        name: 1,
        email: 1,
      });
      return admin;
    }
    const user = await this.userService.findUserById(userId, {
      _id: 1,
      name: 1,
      email: 1,
    });
    return user;
  }

  public getCommunityTemplateFilterQuery(data: {
    searchQuery: CommunityTemplateSearchQuery,
    filterOptions: CommunityTemplateFilterOptions,
    type?: CommunityTemplateType,
  }): Record<string, any> {
    const { searchQuery, filterOptions, type } = data;
    const matchCondition = {};
    const { value: searchKey, field: searchField } = searchQuery || {};
    if (searchKey?.length && searchField === CommunityTemplateSearchField.NAME) {
      Object.assign(
        matchCondition,
        { name: { $regex: searchKey, $options: 'i' } },
      );
    }

    if (filterOptions?.hasDraft) {
      Object.assign(matchCondition, { draftTemplate: { $exists: true } });
    }
    if (filterOptions?.status) {
      Object.assign(matchCondition, { status: filterOptions.status });
    }
    if (filterOptions?.categoryId) {
      Object.assign(
        matchCondition,
        {
          categories: new Types.ObjectId(filterOptions.categoryId),
        },
      );
    }
    if (type) {
      Object.assign(matchCondition, { type });
    }
    return matchCondition;
  }

  async getCommunityTemplates(
    {
      searchQuery,
      limit,
      offset,
      sortOptions,
      filterOptions,
      type,
    }: GetCommunityTemplatesInput,
  ): Promise<{
      templates: CommunityTemplate[],
      total: number,
    }> {
    const matchCondition = this.getCommunityTemplateFilterQuery({ searchQuery, filterOptions, type });

    const sortCondition = !isEmpty(sortOptions) ? this.sortOptionsMapping(sortOptions) : { lastUpdate: -1 } as any;

    const lookupCategoryExpression = {
      from: 'templatecategories',
      localField: 'categories',
      foreignField: '_id',
      as: 'categories',
    };

    const lookupOwnerExpression = {
      from: type === CommunityTemplateType.SYSTEM ? 'admins' : 'users',
      as: 'owner',
      let: { ownerId: '$ownerId' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$ownerId', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    };

    const lookupModifiedExpression = {
      from: type === CommunityTemplateType.SYSTEM ? 'admins' : 'users',
      as: 'lastModifier',
      let: { lastModifiedBy: '$lastModifiedBy' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$lastModifiedBy', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    };

    const facetStage = {
      metadata: [{ $count: 'total' }],
      templateList: [
        { $sort: sortCondition },
        { $skip: offset },
        { $limit: limit },
      ],
    };

    const [templateData] = await this.aggregateQuery([
      {
        $match: matchCondition,
      },
      {
        $lookup: lookupCategoryExpression,
      },
      {
        $lookup: lookupOwnerExpression,
      },
      {
        $unwind: '$owner',
      },
      {
        $lookup: lookupModifiedExpression,
      },
      {
        $unwind: '$lastModifier',
      },
      {
        $facet: facetStage,
      },
    ]);

    const { templateList } = templateData;
    const totalTemplates = templateData?.metadata[0]?.total || 0;
    return {
      templates: templateList,
      total: totalTemplates,
    };
  }

  async getPublishedTemplates(
    {
      searchQuery,
      limit,
      offset,
      sortOptions,
      filterOptions,
    }: GetPublishedTemplatesInput,
  ): Promise<{
      templates: CommunityTemplate[],
      currentCategory: TemplateCategory,
      total: number,
    }> {
    const { categorySlug } = filterOptions || {};
    const matchCondition = this.getCommunityTemplateFilterQuery({
      searchQuery,
      filterOptions: {
        ...filterOptions,
        status: CommunityTemplateFilterStatus.LIVE,
      },
    });

    const sortCondition = !isEmpty(sortOptions) ? this.sortOptionsMapping(sortOptions) : { lastUpdate: -1 } as any;

    const lookupCategoryExpression = {
      from: 'templatecategories',
      localField: 'categories',
      foreignField: '_id',
      as: 'categories',
    };

    const lookupAdminExpression = {
      from: 'admins',
      as: 'admin',
      let: { ownerId: '$ownerId' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$ownerId', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    };

    const lookupUserExpression = {
      from: 'users',
      as: 'user',
      let: { ownerId: '$ownerId' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$ownerId', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    };

    const lookupAdminModifiedExpression = {
      from: 'admins',
      as: 'lastAdminModifier',
      let: { lastModifiedBy: '$lastModifiedBy' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$lastModifiedBy', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    };

    const lookupUserModifiedExpression = {
      from: 'users',
      as: 'lastUserModifier',
      let: { lastModifiedBy: '$lastModifiedBy' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$lastModifiedBy', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    };

    const facetStage = {
      metadata: [{ $count: 'total' }],
      templateList: [
        { $sort: sortCondition },
        { $skip: offset },
        { $limit: limit },
      ],
    };

    const pipeline: PipelineStage[] = [
      {
        $match: matchCondition,
      },
      {
        $lookup: lookupCategoryExpression,
      },
      {
        $lookup: lookupAdminExpression,
      },
      {
        $unwind: {
          path: '$admin',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: lookupUserExpression,
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          owner: {
            $cond: {
              if: { $eq: ['$type', CommunityTemplateType.SYSTEM] },
              then: '$admin',
              else: '$user',
            },
          },
        },
      },
      {
        $lookup: lookupAdminModifiedExpression,
      },
      {
        $unwind: {
          path: '$lastAdminModifier',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: lookupUserModifiedExpression,
      },
      {
        $unwind: {
          path: '$lastUserModifier',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          lastModifier: {
            $cond: {
              if: { $eq: ['$type', CommunityTemplateType.SYSTEM] },
              then: '$lastAdminModifier',
              else: '$lastUserModifier',
            },
          },
        },
      },
    ];

    if (categorySlug) {
      pipeline.push({
        $match: {
          categories: {
            $elemMatch: { slug: categorySlug },
          },
        },
      });
    }

    pipeline.push(
      {
        $project: {
          _id: 1,
          name: 1,
          url: 1,
          thumbnails: 1,
          description: 1,
          categories: 1,
          metaTitle: 1,
          metaDescription: 1,
          metaKeywords: 1,
          remoteId: 1,
          owner: 1,
          lastModifier: 1,
          publishDate: 1,
          status: 1,
          type: 1,
          counter: 1,
          rateStar: 1,
          lastUpdate: 1,
          relatedTemplates: 1,
        },
      },
      {
        $facet: facetStage,
      },
    );

    const [[templateData], [currentCategory]] = await Promise.all([
      this.aggregateQuery(pipeline),
      categorySlug ? this.findTemplateCategories({ slug: categorySlug }) : [],
    ]);

    const { templateList, metadata } = templateData;
    const totalTemplates = metadata[0]?.total || 0;
    return {
      templates: templateList,
      currentCategory: currentCategory ? { ...currentCategory, _id: currentCategory._id } : null,
      total: totalTemplates,
    };
  }

  async getCategoriesByAdmin(
    input: GetTemplateCategoryInput,
  ): Promise<GetTemplateCategoryPayload> {
    const {
      searchQuery = { value: '' },
      limit,
      offset,
      sortOptions,
    } = input;
    const matchCondition = searchQuery.value ? { name: { $regex: searchQuery.value, $options: 'i' } } : {};
    const sortCondition = !isEmpty(sortOptions) ? this.sortOptionsMapping(sortOptions) : { updatedAt: -1 } as any;

    const facetStage = {
      metadata: [{ $count: 'total' }],
      categories: [
        { $sort: sortCondition },
        { $skip: offset },
        { $limit: limit },
      ],
    };
    const queryCreatorExpression = {
      from: 'admins',
      as: 'creator',
      let: { creator: '$creator' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$creator', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    };

    const queryLastEditorExpression = {
      from: 'admins',
      as: 'lastEditorBy',
      let: { lastEditor: '$lastEditor' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$lastEditor', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    };

    const queryNumberTemplateBondeds = {
      from: 'communitytemplates',
      localField: '_id',
      foreignField: 'categories',
      as: 'communityTemplates',
    };

    const pipelines: any = [
      {
        $match: matchCondition,
      },
      {
        $lookup: queryCreatorExpression,
      },
      {
        $unwind: '$creator',
      },
      {
        $lookup: queryLastEditorExpression,
      },
      {
        $unwind: '$lastEditorBy',
      },
      {
        $lookup: queryNumberTemplateBondeds,
      },
      {
        $addFields: {
          numberTemplateBonded: { $size: '$communityTemplates' },
        },
      },
      {
        $facet: facetStage,
      },
    ];
    const [categoryData] = await this.templateCategoryModel.aggregate(pipelines as PipelineStage[]);
    const { categories, metadata } = categoryData;
    const totalCategories = metadata[0]?.total || 0;
    return {
      categories,
      total: totalCategories,
    };
  }

  async updateCategory(filters: FilterQuery<ITemplateCategory>, updatedFields: UpdateQuery<ITemplateCategory>): Promise<ITemplateCategory> {
    const templateCategory = await this.templateCategoryModel.findOneAndUpdate(filters, updatedFields).exec();
    return templateCategory ? { ...templateCategory.toObject(), _id: templateCategory._id.toHexString() } : null;
  }

  async getTemplateDetail(matchCondition: Record<string, any>): Promise<{ template?: CommunityTemplate, error?: GraphErrorException }> {
    const pipelines = [
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: 'templatecategories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories',
        },
      },
      {
        $addFields: {
          hasDraft: {
            $cond: {
              if: { $ifNull: ['$draftTemplate', false] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'templatecategories',
          localField: 'draftTemplate.categories',
          foreignField: '_id',
          as: 'draftTemplate.categories',
        },
      },
      {
        $addFields: {
          draftTemplate: {
            $cond: {
              if: { $eq: ['$hasDraft', true] },
              then: '$draftTemplate',
              else: null,
            },
          },
        },
      },
    ];
    const [template] = await this.aggregateQuery(pipelines) as ICommunityTemplate[];
    if (!template) {
      return {
        error: GraphErrorException.BadRequest(
          'Template not found',
          ErrorCode.Template.TEMPLATE_NOT_FOUND,
        ),
      };
    }
    if (template.draftTemplate && !get(template, 'draftTemplate.categories.length')) {
      delete template.draftTemplate.categories;
    }
    return { template: { ...template, _id: template._id.toHexString() } as CommunityTemplate };
  }

  private getDraftState(template: ICommunityTemplate, draft: DraftTemplateInput): Omit<Partial<IDraftTemplate>, 'deleteThumbnailIds'> {
    const parsedDraft = omitBy(draft, isNil);
    if (!template.draftTemplate) {
      return {
        thumbnails: template.thumbnails,
        ...parsedDraft,
      };
    }
    const currentDraft = template.draftTemplate;
    return {
      ...template.draftTemplate,
      thumbnails: currentDraft.thumbnails?.length ? currentDraft.thumbnails : template.thumbnails,
      ...parsedDraft,
    };
  }

  async editTemplateDetail({
    editorId, templateId, draft, thumbnails,
  }: { editorId: string, templateId: string, draft: DraftTemplateInput, thumbnails: FileData[] }): Promise<{
    template?: CommunityTemplate,
    error?: GraphErrorException
  }> {
    if (!Object.keys(draft).length && !thumbnails.length) {
      return {
        error: GraphErrorException.NotFound('Empty draft template input'),
      };
    }
    const template = await this.findOneById(templateId, {
      thumbnails: 1, draftTemplate: 1, type: 1, name: 1,
    });
    const {
      name: templateName,
      type,
    } = template;
    if (!template) {
      return {
        error: GraphErrorException.NotFound('Template not found', ErrorCode.Template.TEMPLATE_NOT_FOUND),
      };
    }

    const currentDraft = this.getDraftState(template, draft);

    if (draft.categories) {
      try {
        const isAllExisted = await this.validateAllCategoriesExistence(draft.categories);
        if (isAllExisted) {
          currentDraft.categories = draft.categories;
        }
      } catch (e) {}
    }

    if (draft.deleteThumbnailIds?.length) {
      currentDraft.thumbnails = difference(currentDraft.thumbnails, draft.deleteThumbnailIds);
    }

    if (
      draft.deleteThumbnailIds?.length
      && currentDraft.thumbnails
      && !inRange(currentDraft.thumbnails.length, MIN_THUMBNAIL_OF_TEMPLATE, MAX_THUMBNAIL_OF_TEMPLATE + 1)
    ) {
      return {
        error: GraphErrorException.Forbidden(
          `Total template thumbnails must be between ${MIN_THUMBNAIL_OF_TEMPLATE} and ${MAX_THUMBNAIL_OF_TEMPLATE}`,
        ),
      };
    }

    if (draft.url) {
      const isExist = await this.isExistUrl(currentDraft.url, [template._id]);
      if (isExist) {
        return {
          error: GraphErrorException.Conflict('This URL has been taken'),
        };
      }
    }

    // eslint-disable-next-line no-unsafe-optional-chaining
    if (thumbnails.length && thumbnails.length + currentDraft.thumbnails?.length <= MAX_THUMBNAIL_OF_TEMPLATE) {
      const thumbnailKeyFiles = await Promise.all(
        thumbnails.map((thumbnail) => this.awsService.uploadThumbnailWithBuffer(thumbnail.fileBuffer, thumbnail.mimetype)),
      );
      currentDraft.thumbnails = [...currentDraft.thumbnails, ...thumbnailKeyFiles].filter(Boolean);
    }

    const updateObject = this.mergeDraftTemplateObject(currentDraft);

    await this.updateOne(templateId, {
      $set: {
        ...updateObject,
        lastModifiedBy: editorId,
        lastUpdate: Date.now(),
      },
    });
    const {
      template: templateDetail,
    } = await this.getTemplateDetail({
      _id: new Types.ObjectId(templateId),
    });

    const editor = await this.adminService.findById(editorId);
    const {
      _id, name, email, avatarRemoteId,
    } = editor;

    const eventData = new CommunityTemplateEventBuilder()
      .setActor({
        _id,
        name,
        avatarRemoteId,
        email,
      })
      .setTargetTemplate({
        _id: templateId,
        name: templateName,
        type,
      })
      .setScope([EventScopes.ADMIN])
      .setName(CommunityTemplateActionEvent.TEMPLATE_EDITED)
      .build();
    this.eventService.createEvent(eventData);

    return {
      template: templateDetail,
    };
  }

  async getRelatedTemplatesByCategory(template: CommunityTemplate): Promise<CommunityTemplate[]> {
    const { _id: templateId, categories } = template;
    const categoryIds = categories.map(({ _id: categoryId }) => new Types.ObjectId(categoryId));

    const pipelines = [
      {
        $match: {
          _id: { $ne: new Types.ObjectId(templateId) },
        },
      },
      {
        $facet: {
          similarCategoryTemplates: [
            {
              $match: {
                categories: {
                  $elemMatch: { $in: categoryIds },
                },
              },
            },
            { $limit: RELATED_COMMUNITY_TEMPLATE_NUMBER },
          ],
          otherCategoryTemplates: [
            {
              $match: {
                categories: { $nin: categoryIds },
              },
            },
            { $limit: RELATED_COMMUNITY_TEMPLATE_NUMBER },
          ],
        },
      },
    ];

    const [data] = await this.aggregateQuery(pipelines);
    const { similarCategoryTemplates, otherCategoryTemplates } = data;
    return [...similarCategoryTemplates, ...otherCategoryTemplates].slice(0, RELATED_COMMUNITY_TEMPLATE_NUMBER);
  }

  async deleteTemplate({ templateId, adminId }: { templateId: string, adminId: string }): Promise<CommunityTemplate> {
    const [foundTemplate, admin] = await Promise.all([
      this.findOneById(templateId),
      this.adminService.findById(adminId),
    ]);
    if (!foundTemplate) {
      throw GraphErrorException.NotFound('Template not found');
    }
    const {
      _id, name, email, avatarRemoteId,
    } = admin;

    const eventData = new CommunityTemplateEventBuilder()
      .setActor({
        _id,
        name,
        email,
        avatarRemoteId,
      })
      .setName(CommunityTemplateActionEvent.TEMPLATE_DELETED)
      .setTargetTemplate({
        _id: templateId,
        name: foundTemplate.name,
        type: foundTemplate.type,
      })
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);
    return this.deleteOne(templateId) as CommunityTemplate;
  }

  async unpublishCommunityTemplate({ actorId, templateId }:{ actorId: string, templateId: string }): Promise<{
    template?: CommunityTemplate,
    error?: GraphErrorException,
  }> {
    const template = await this.findOneById(templateId);

    if (!template) {
      return {
        error: GraphErrorException.NotFound('Template not found', ErrorCode.Template.TEMPLATE_NOT_FOUND),
      };
    }
    if (template.status === CommunityTemplateState.UNPUBLISH) {
      return {
        error: GraphErrorException.Conflict('Template has been unpublished', ErrorCode.CommunityTemplate.TEMPLATE_HAS_UNPUBLISHED),
      };
    }
    const updatedTemplate = await this.updateOne(
      templateId,
      { status: CommunityTemplateState.UNPUBLISH, lastModifiedBy: actorId },
    );

    const actor = await this.adminService.findById(actorId);
    const {
      name, _id, email, avatarRemoteId,
    } = actor;
    const { name: templateName, type } = template;
    const eventData = new CommunityTemplateEventBuilder()
      .setActor({
        name,
        _id,
        email,
        avatarRemoteId,
      })
      .setTargetTemplate({
        _id: templateId,
        name: templateName,
        type,
      })
      .setName(CommunityTemplateActionEvent.TEMPLATE_UNPUBLISHED)
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);

    return {
      template: updatedTemplate as Template,
    };
  }

  async publishCommunityTemplate({ publisherId, templateId }:{ publisherId: string, templateId: string }): Promise<{
    template?: CommunityTemplate,
    error?: GraphErrorException,
  }> {
    const template = await this.findOneById(templateId);
    if (!template) {
      return {
        error: GraphErrorException.NotFound('Template not found', ErrorCode.Template.TEMPLATE_NOT_FOUND),
      };
    }
    if (template.status === CommunityTemplateState.LIVE && !template.draftTemplate) {
      return {
        error: GraphErrorException.Conflict('Template has been published', ErrorCode.CommunityTemplate.TEMPLATE_HAS_PUBLISHED),
      };
    }

    const publisher = await this.adminService.findById(publisherId);
    const {
      name, _id, email, avatarRemoteId,
    } = publisher;
    const { name: templateName, type } = template;
    const eventData = new CommunityTemplateEventBuilder()
      .setActor({
        name,
        _id,
        email,
        avatarRemoteId,
      })
      .setTargetTemplate({
        _id: templateId,
        name: templateName,
        type,
      })
      .setName(CommunityTemplateActionEvent.TEMPLATE_PUBLISHED)
      .setScope([EventScopes.ADMIN])
      .build();
    this.eventService.createEvent(eventData);
    const currentDraft = template.draftTemplate || {};
    const updateObject = merge(
      currentDraft,
      { lastModifiedBy: publisherId, publishDate: Date.now(), status: CommunityTemplateState.LIVE },
    );
    unset(updateObject, 'draftTemplate');
    const updatedTemplate = await this.updateOne(
      templateId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      { ...updateObject, $unset: { draftTemplate: true } },
    );
    return { template: { ...updatedTemplate, _id: updatedTemplate._id.toHexString() } as Template };
  }

  async adminUploadTemplate(data: {
    uploaderId: string;
    input: AdminUploadTemplateInput,
    templateFile: FileData,
    thumbnailFiles: FileData[]
  }): Promise<{
    template: ICommunityTemplate,
    error?: GraphErrorException,
  }> {
    const {
      uploaderId,
      input,
      templateFile,
      thumbnailFiles,
    } = data;
    // check url existence
    const isExistUrl = await this.isExistUrl(input.url);
    if (isExistUrl) {
      return {
        template: null,
        error: GraphErrorException.Conflict('This URL has been taken', ErrorCode.Template.URL_TAKEN),
      };
    }

    // check template categories existence
    const isValidCategories = await this.validateAllCategoriesExistence(input.categories);
    if (!isValidCategories) {
      return {
        template: null,
        error: GraphErrorException.Conflict('Categories are not existed'),
      };
    }

    // upload file to s3
    const [templateKeyFile, ...thumbnailKeyFiles] = await Promise.all([
      this.awsService.uploadTemplateWithBuffer(templateFile.fileBuffer, templateFile.mimetype, CommunityTemplateStorageNamespace.COMMUNITY),
      ...thumbnailFiles.map((thumbnail) => this.awsService.uploadThumbnailWithBuffer(thumbnail.fileBuffer, thumbnail.mimetype)),
    ]);

    const template = await this.create({
      name: input.name,
      thumbnails: thumbnailKeyFiles,
      description: input.description,
      categories: input.categories,
      url: input.url,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      metaKeywords: input.metaKeywords,
      remoteId: templateKeyFile,
      ownerId: uploaderId,
      lastModifiedBy: uploaderId,
    } as ICommunityTemplate);

    return {
      template,
    };
  }

  async getTemplateCategoryDetail(categoryId: string): Promise<{
    error?: GraphErrorException,
    category?: TemplateCategory,
  }> {
    const queryNumberTemplateBondeds = {
      from: 'communitytemplates',
      localField: '_id',
      foreignField: 'categories',
      as: 'communityTemplates',
    };
    const queryCreatorExpression = {
      from: 'admins',
      as: 'creator',
      let: { creator: '$creator' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$creator', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    };

    const queryLastEditorExpression = {
      from: 'admins',
      as: 'lastEditorBy',
      let: { lastEditor: '$lastEditor' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$lastEditor', '$_id'],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    };

    const pipelines:any = [
      {
        $match: {
          _id: new Types.ObjectId(categoryId),
        },
      },
      {
        $lookup: queryCreatorExpression,
      },
      {
        $unwind: '$creator',
      },
      {
        $lookup: queryLastEditorExpression,
      },
      {
        $unwind: '$lastEditorBy',
      },
      {
        $lookup: queryNumberTemplateBondeds,
      },
      {
        $addFields: {
          numberTemplateBonded: { $size: '$communityTemplates' },
        },
      },
    ];
    const category = await this.templateCategoryModel.aggregate(pipelines as PipelineStage[]).exec();
    if (isEmpty(category)) {
      return {
        error: GraphErrorException.NotFound('Category not found', ErrorCode.TemplateCategory.CATEGORY_NOT_FOUND),
      };
    }
    return {
      category: category[0],
    };
  }

  async editTemplateCategory(input: {name: string, categoryId: string, adminId: string}): Promise<{
    error?: GraphErrorException,
    category?: TemplateCategory,
  }> {
    const {
      name,
      categoryId,
      adminId,
    } = input;
    const existedCategory = await this.findTemplateCategory({ name });
    if (existedCategory) {
      return {
        error: GraphErrorException.Conflict('Category name has already existed', ErrorCode.TemplateCategory.CATEGORY_NAME_HAS_EXISTED),
      };
    }
    const foundCategory = await this.findTemplateCategory({ _id: categoryId });
    if (!foundCategory) {
      return {
        error: GraphErrorException.NotFound('Category not found', ErrorCode.TemplateCategory.CATEGORY_NOT_FOUND),
      };
    }
    await this.updateCategory({ _id: categoryId }, { name, lastEditor: adminId, slug: slugify(name) });

    const [{ category }, admin] = await Promise.all([
      this.getTemplateCategoryDetail(categoryId) as Promise<{ category: TemplateCategory }>,
      this.adminService.findById(adminId),
    ]);
    const {
      _id, name: adminName, avatarRemoteId, email,
    } = admin;
    const eventData = new CommunityTemplateEventBuilder()
      .setActor({
        _id,
        name: adminName,
        avatarRemoteId,
        email,
      })
      .setTargetTemplate({
        _id: categoryId,
        name,
      })
      .setScope([EventScopes.ADMIN])
      .setName(TemplateCategoryActionEvent.CATEGORY_EDITED)
      .build();
    this.eventService.createEvent(eventData);

    return {
      category,
    };
  }

  async countTemplatesByCategoryId(categoryId: string): Promise<{
    error?: GraphErrorException,
    numberTemplateBonded?: number,
  }> {
    const queryNumberTemplateBondeds = {
      from: 'communitytemplates',
      localField: '_id',
      foreignField: 'categories',
      as: 'communityTemplates',
    };
    const pipelines:any = [
      {
        $match: {
          _id: new Types.ObjectId(categoryId),
        },
      },
      {
        $lookup: queryNumberTemplateBondeds,
      },
      {
        $addFields: {
          numberTemplateBonded: { $size: '$communityTemplates' },
        },
      },
    ];
    const category = await this.templateCategoryModel.aggregate(pipelines as PipelineStage[]).exec();
    if (isEmpty(category)) {
      return {
        error: GraphErrorException.NotFound('Category not found', ErrorCode.TemplateCategory.CATEGORY_NOT_FOUND),
      };
    }
    return {
      numberTemplateBonded: category[0].numberTemplateBonded,
    };
  }

  async deleteTemplateCategory({ categoryId, adminId }: { categoryId: string, adminId: string }): Promise<void> {
    const [admin, category] = await Promise.all([
      this.adminService.findById(adminId),
      this.templateCategoryModel.findById(categoryId),
    ]);
    const {
      _id, name, avatarRemoteId, email,
    } = admin;
    const eventData = new CommunityTemplateEventBuilder()
      .setActor({
        _id,
        name,
        avatarRemoteId,
        email,
      })
      .setTargetTemplate({
        _id: categoryId,
        name: category.name,
      })
      .setScope([EventScopes.ADMIN])
      .setName(TemplateCategoryActionEvent.CATEGORY_DELETED)
      .build();
    this.eventService.createEvent(eventData);
    await this.templateCategoryModel.deleteOne({ _id: categoryId });
  }

  updateRateStarCommunityTemplate(templateId: string, updateObj: Record<string, any>): Promise<ICommunityTemplate> {
    return this.updateOne(templateId, updateObj, { new: true });
  }
}

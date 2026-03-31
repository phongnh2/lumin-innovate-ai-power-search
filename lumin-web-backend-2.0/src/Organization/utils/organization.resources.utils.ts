import { Model, Types } from 'mongoose';

import { DocumentRoleEnum } from 'Document/document.enum';
import { IDocument, IDocumentPermissionModel } from 'Document/interfaces';
import { FolderRoleEnum } from 'Folder/folder.enum';
import {
  IFolder,
  IFolderPermissionModel,
} from 'Folder/interfaces/folder.interface';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { User } from 'User/interfaces/user.interface';

export class OrganizationResourcesLookupUtils<
  ResourceType extends IDocument | IFolder,
> {
  private user: User;

  private organization: IOrganization;

  private userTeams: ITeam[];

  private model:
    | Model<IDocumentPermissionModel>
    | Model<IFolderPermissionModel>;

  private get resourceCollection(): string {
    return this.resourceConfig.collection;
  }

  private get resourceId(): string {
    return this.resourceConfig.id;
  }

  private get roles() {
    return this.resourceConfig.roles;
  }

  private get sortField() {
    return this.resourceConfig.sortField;
  }

  private get resourceConfig() {
    const config = {
      DocumentPermission: {
        collection: 'documents',
        id: 'documentId',
        roles: DocumentRoleEnum,
        sortField: 'lastAccess',
      },
      FolderPermission: {
        collection: 'folders',
        id: 'folderId',
        roles: FolderRoleEnum,
        sortField: 'createdAt',
      },
    };

    return config[this.model.modelName];
  }

  constructor(payload: {
    user: User;
    organization: IOrganization;
    userTeams: ITeam[];
    model: Model<IDocumentPermissionModel> | Model<IFolderPermissionModel>;
  }) {
    const {
      user, organization, userTeams, model,
    } = payload;
    this.user = user;
    this.organization = organization;
    this.userTeams = userTeams;
    this.model = model;
  }

  public async lookup({
    searchKey,
    cursor,
    limit,
  }: {
    searchKey?: string;
    cursor?: string;
    limit: number;
  }): Promise<{ results: ResourceType[]; cursor: string | null; total: number }> {
    const [results] = await this.model.aggregate<{
      total: { count: number }[];
      data: ResourceType[];
    }>([
      {
        $match: {
          $or: [
            {
              refId: new Types.ObjectId(this.user._id),
              role: this.roles.OWNER,
              'workspace.refId': new Types.ObjectId(this.organization._id),
            },
            {
              refId: new Types.ObjectId(this.organization._id),
              role: this.roles.ORGANIZATION,
            },
            {
              refId: {
                $in: this.userTeams.map((team) => new Types.ObjectId(team._id)),
              },
              role: this.roles.ORGANIZATION_TEAM,
            },
          ],
        },
      },
      {
        $lookup: {
          from: this.resourceCollection,
          let: { resourceId: `$${this.resourceId}` },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$resourceId'] },
                    ...(cursor
                      ? [{ $lte: [`$${this.sortField}`, new Date(Number(cursor))] }]
                      : []),
                    {
                      $regexMatch: {
                        input: '$name',
                        regex: searchKey,
                        options: 'i',
                      },
                    },
                  ],
                },
              },
            },
          ],
          as: 'resource',
        },
      },
      {
        $facet: {
          total: [
            { $match: { 'resource.0': { $exists: true } } },
            { $count: 'count' },
          ],
          data: [
            {
              $sort: { [`resource.${this.sortField}`]: -1 },
            },
            {
              $limit: limit + 1,
            },
            {
              $unwind: '$resource',
            },
            {
              $replaceRoot: {
                newRoot: '$resource',
              },
            },
          ],
        },
      },
    ]);

    return {
      results: results.data.slice(0, limit),
      total: results.total.length ? results.total[0].count : 0,
      cursor: results.data[limit]
        ? String(new Date(results.data[limit][this.sortField] as string).getTime())
        : null,
    };
  }
}

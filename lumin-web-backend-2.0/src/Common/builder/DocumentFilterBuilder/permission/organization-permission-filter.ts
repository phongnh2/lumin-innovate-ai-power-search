import { AbstractPermissionFilter, PermissionFilter } from 'Common/builder/DocumentFilterBuilder/permission/permission-filter';

import { DocumentKindEnum, DocumentRoleEnum, DocumentWorkspace } from 'Document/document.enum';
import { DocumentTab } from 'graphql.schema';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';

import { AsyncQueueFunc } from '../base-document-filter';

class OrganizationPermissionFilter extends PermissionFilter implements AbstractPermissionFilter<PermissionFilter> {
  constructor(
    protected readonly _organizationTeamService: OrganizationTeamService,
  ) {
    super();
  }

  private async getTeamIdsByUser(): Promise<string[]> {
    const teams = await this._organizationTeamService.getMembershipsInOrgTeam(this._resource._id, this._user._id);
    const teamIds = teams.map((membership) => membership.teamId);
    return teamIds;
  }

  private async buildAccessibleFilter(options: { includeStarred?: boolean }) {
    const { includeStarred = true } = options || {};
    const teamIds = await this.getTeamIdsByUser();
    const filters: Record<string, any>[] = [
      {
        refId: {
          $in: [...new Set([...teamIds, this._resourceId])],
        },
      },
      {
        refId: this._userId,
        role: DocumentRoleEnum.OWNER,
        workspace: {
          refId: this._resource._id,
          type: DocumentWorkspace.ORGANIZATION,
        },
      },
    ];

    if (includeStarred) {
      filters.push({
        refId: this._userId,
        role: { $ne: DocumentRoleEnum.OWNER },
      });
    }
    Object.assign(this._filter, {
      $or: filters,
    });
  }

  addTab(tab: DocumentTab): OrganizationPermissionFilter {
    switch (tab) {
      case DocumentTab.MY_DOCUMENT: {
        Object.assign(this._filter, {
          refId: this._userId,
          role: DocumentRoleEnum.OWNER,
          workspace: {
            refId: this._resource._id,
            type: DocumentWorkspace.ORGANIZATION,
          },
        });
        break;
      }
      case DocumentTab.SHARED_WITH_ME: {
        Object.assign(this._filter, {
          refId: this._userId,
          role: { $ne: DocumentRoleEnum.OWNER },
        });
        break;
      }
      case DocumentTab.ORGANIZATION:
      case DocumentTab.TRENDING:
        Object.assign(this._filter, {
          refId: this._resourceId,
        });
        break;
      case DocumentTab.STARRED:
        this.pushToAsyncQueue(this.buildAccessibleFilter.bind(this) as AsyncQueueFunc);
        break;
      case DocumentTab.ACCESSIBLE:
        this.pushToAsyncQueue(this.buildAccessibleFilter.bind(this, { includeStarred: false }) as AsyncQueueFunc);
        break;
      default:
        throw new Error(`The document tab ${tab} is unknown or not supported.`);
    }

    return this;
  }

  addKind(kind: DocumentKindEnum): this {
    Object.assign(this._filter, {
      documentKind: kind,
    });
    return this;
  }
}

export { OrganizationPermissionFilter };

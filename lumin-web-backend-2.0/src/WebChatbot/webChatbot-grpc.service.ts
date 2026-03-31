import { Injectable } from '@nestjs/common';

import { DefaultErrorCode } from 'Common/constants/ErrorCode';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';

import { FolderService } from 'Folder/folder.service';
import { DocumentTab, GetDocumentPayload } from 'graphql.schema';
import { OrganizationService } from 'Organization/organization.service';
import { TeamService } from 'Team/team.service';
import { UserService } from 'User/user.service';

export interface GetDocumentsRequest {
  targetId: string;
  target: 'ORGANIZATION' | 'TEAM';
  tab: DocumentTab;
  userId: string;
  limit?: number;
  folderId?: string;
}

@Injectable()
export class WebChatbotGrpcService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly teamService: TeamService,
    private readonly folderService: FolderService,
  ) {}

  async getDocuments(input: GetDocumentsRequest): Promise<GetDocumentPayload> {
    const {
      targetId, target, tab, userId, folderId,
    } = input;

    if (input.limit > 200) {
      throw GrpcErrorException.InvalidArgument('Limit must be less than 200', DefaultErrorCode.BAD_REQUEST);
    }

    const user = await this.userService.findUserById(userId);

    const organization = await this.organizationService.getOrgById(targetId);

    if (tab === DocumentTab.RECENT) {
      return this.organizationService.getRecentDocumentList({
        user,
        organization,
        input: {
          query: {
            minimumQuantity: input.limit || 50,
          },
          filter: {
          },
        },
      });
    }

    if (folderId) {
      return this.folderService.getDocuments({
        user,
        folderId,
        query: {
          minimumQuantity: input.limit || 50,
        },
        filter: {},
      });
    }

    return this.organizationService.getDocuments({
      user,
      resource: target === 'ORGANIZATION' ? organization : await this.teamService.findOneById(targetId),
      tab,
      query: {
        minimumQuantity: input.limit || 50,
      },
      filter: {},
    });
  }
}

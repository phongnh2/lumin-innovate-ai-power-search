import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Observable } from 'rxjs';

import { LoggerService } from 'Logger/Logger.service';
import { IOrganizationMemberModel } from 'Organization/interfaces/organization.member.interface';
import { OrganizationService } from 'Organization/organization.service';

import { Member, MemberChunkPayload, MemberMessageEvent } from './interfaces/admin-sse.interface';

@Injectable()
export class SseService {
  private readonly CHUNK_SIZE = 500;

  constructor(
    private readonly organizationService: OrganizationService,
    @InjectModel('OrganizationMember')
    private readonly organizationMemberModel: Model<IOrganizationMemberModel>,
    private readonly loggerService: LoggerService,
  ) {}

  async getTotalMembers(orgId: string): Promise<number> {
    return this.organizationMemberModel.countDocuments({ orgId: new Types.ObjectId(orgId) }).exec();
  }

  fetchMembersChunk(
    orgId: string,
    lastId?: string,
    limit: number = 500,
  ): Promise<{ members: Member[]; lastId?: string; hasMore: boolean }> {
    return this.organizationService.getMembersChunk(orgId, lastId, limit);
  }

  async streamMembers(orgId: string, userId: string): Promise<Observable<MemberMessageEvent>> {
    const totalMembers = await this.getTotalMembers(orgId);
    this.loggerService.info({
      context: `${userId} export member list`,
      extraInfo: {
        organizationId: orgId,
        adminId: userId,
        memberCount: totalMembers,
      },
    });
    return new Observable((subscriber) => {
      (async () => {
        try {
          let lastId: string | undefined;
          let chunkIndex = 0;
          let hasMore = true;

          const maxIterations = Math.ceil(totalMembers / this.CHUNK_SIZE);
          while (hasMore && chunkIndex < maxIterations) {
            // eslint-disable-next-line no-await-in-loop
            const result = await this.fetchMembersChunk(orgId, lastId, this.CHUNK_SIZE);

            const chunk: MemberChunkPayload = {
              chunkIndex,
              members: result.members,
              isLastChunk: !result.hasMore,
            };

            const event: MemberMessageEvent = {
              event: 'member_chunk',
              data: chunk,
            };

            subscriber.next(event);

            lastId = result.lastId;
            hasMore = result.hasMore;
            chunkIndex++;
          }

          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      })();
    });
  }
}

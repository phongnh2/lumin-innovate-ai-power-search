import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery, Model, PipelineStage, ClientSession, QueryOptions,
} from 'mongoose';

import { SortStrategy } from 'Common/common.enum';
import { Utils } from 'Common/utils/Utils';

import { BlacklistActionEnum } from 'Blacklist/blacklist.enum';
import { IBlacklist, IBlacklistModel, IMetadata } from 'Blacklist/interfaces/blacklist.interface';
import { BlacklistSortOptions } from 'graphql.schema';

@Injectable()
export class BlacklistService {
  constructor(
    @InjectModel('Blacklist') private readonly blacklistModel: Model<IBlacklistModel>,
  ) {}

  public async createWithTransaction(actionType: BlacklistActionEnum, value: string, session: ClientSession = null): Promise<IBlacklist[]> {
    const data: any = { actionType, value };
    const blacklists = await this.blacklistModel.create([data], { session });
    return blacklists.map((blacklist) => ({ ...blacklist.toObject(), _id: blacklist._id.toHexString() }));
  }

  public async create(actionType: BlacklistActionEnum, value: string, metadata?: IMetadata): Promise<IBlacklist> {
    const data: any = { actionType, value, metadata };
    const blacklist = await this.blacklistModel.create(data);
    return { ...blacklist.toObject(), _id: blacklist._id.toHexString() };
  }

  public async findOne(actionType: BlacklistActionEnum, value: string, metadata?: IMetadata): Promise<IBlacklist> {
    const { rejectedUserId } = metadata || {};
    let blacklist;
    if (rejectedUserId) {
      blacklist = await this.blacklistModel.findOne({ actionType, value, 'metadata.rejectedUserId': rejectedUserId }).exec();
    }
    blacklist = await this.blacklistModel.findOne({ actionType, value }).exec();
    return blacklist ? { ...blacklist.toObject(), _id: blacklist._id.toHexString() } : null;
  }

  public async findOneAndDelete(actionType: BlacklistActionEnum, value: string, options?: QueryOptions<IBlacklist>): Promise<IBlacklist> {
    const deletedResult = await this.blacklistModel.findOneAndDelete({ actionType, value }, options).exec();
    return deletedResult ? { ...deletedResult.toObject(), _id: deletedResult._id.toHexString() } : null;
  }

  public async findAll(actionType: BlacklistActionEnum, values: string[]): Promise<IBlacklist[]> {
    const blacklists = await this.blacklistModel.find({ actionType, value: { $in: values } }).exec();
    return blacklists.map((blacklist) => ({ ...blacklist.toObject(), _id: blacklist._id.toHexString() }));
  }

  public async getBlacklistByUserIds(actionType: BlacklistActionEnum, value: string, rejectedUserIds: string[]): Promise<IBlacklist[]> {
    const blacklists = await this.blacklistModel.find({ actionType, value, 'metadata.rejectedUserId': { $in: rejectedUserIds } }).exec();
    return blacklists.map((blacklist) => ({ ...blacklist.toObject(), _id: blacklist._id.toHexString() }));
  }

  public async getAllBlackList(actionType: BlacklistActionEnum, params: {
    searchKey: string;
    limit: number;
    offset: number;
    sortOptions?: BlacklistSortOptions;
  }): Promise<[IBlacklist[], number]> {
    const {
      searchKey,
      limit,
      offset,
      sortOptions,
    } = params;
    const matchCondition = { actionType };

    if (searchKey.length) {
      const searchKeyRegex = Utils.transformToSearchRegex(searchKey);
      Object.assign(matchCondition, {
        value: { $regex: searchKeyRegex, $options: 'i' },
      });
    }
    const sortStrategy = {
      ...(sortOptions?.createdAt
        ? { createdAt: SortStrategy[sortOptions.createdAt] }
        : { createdAt: -1 }),
    };

    const facetStage = {
      $facet: {
        metadata: [{ $count: 'total' }],
        blacklist: [
          {
            $sort: sortStrategy,
          },
          { $skip: offset },
          {
            $limit: limit,
          },
        ],
      },
    };

    const aggregateInput: PipelineStage[] = [
      { $match: matchCondition },
      facetStage as PipelineStage.Facet,
    ];
    const [data] = await this.blacklistModel.aggregate(aggregateInput);
    return [
      data.blacklist,
      data.metadata[0]?.total || 0,
    ];
  }

  async distinct(field: string, filter?: FilterQuery<IBlacklist>): Promise<string[]> {
    return this.blacklistModel.distinct(field, filter);
  }
}

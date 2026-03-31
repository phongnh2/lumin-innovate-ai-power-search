import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  UpsertFunctionalLandingPageRatingDto,
  GetFunctionalLandingPageRatingDto,
} from './dtos';
import { IFunctionalLandingPageRatingModel } from './interfaces/functional-landing-page-rating.interface';

@Injectable()
export class FunctionalLandingPageRatingService {
  constructor(
    @InjectModel('FunctionalLandingPageRating')
    private readonly functionalLandingPageRatingModel: Model<IFunctionalLandingPageRatingModel>,
  ) {}

  async upsert(
    params: UpsertFunctionalLandingPageRatingDto,
  ): Promise<IFunctionalLandingPageRatingModel> {
    const { action, stars } = params;
    const update = {
      $inc: {
        [`stars.${stars}`]: 1,
        totalVotes: 1,
      },
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return this.functionalLandingPageRatingModel.findOneAndUpdate(
      { action },
      update,
      options,
    );
  }

  async findOne({
    action,
  }: GetFunctionalLandingPageRatingDto): Promise<IFunctionalLandingPageRatingModel> {
    const existingRating = await this.functionalLandingPageRatingModel
      .findOne({ action })
      .exec();
    if (existingRating) {
      return existingRating;
    }
    const FunctionalLandingPageRatingModel = this.functionalLandingPageRatingModel;
    return new FunctionalLandingPageRatingModel({
      action,
    });
  }
}

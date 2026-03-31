import type { Types } from 'mongoose';

export interface IFunctionalLandingPageRating {
  action: string;
  stars: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  totalVotes: number;
}

export interface IFunctionalLandingPageRatingModel extends IFunctionalLandingPageRating {
  _id: Types.ObjectId;
}

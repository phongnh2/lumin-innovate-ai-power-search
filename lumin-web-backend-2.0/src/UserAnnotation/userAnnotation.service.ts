import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';

import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import {
  CreateUserAnnotationInput,
  GetUserAnnotationInput,
  UpdateUserAnnotationPositionInput,
  UserAnnotation,
  GetUserAnnotationResponse,
} from 'graphql.schema';

import { USER_ANNOTATION_LIMIT } from './constants';
import { IRubberStamp, IUserAnnotation } from './interfaces/userAnnotation.interface';
import { UserAnnotationType } from './userAnnotation.enum';

@Injectable()
export class UserAnnotationService {
  constructor(
    @InjectModel('UserAnnotation') private readonly userAnnotationModel: Model<IUserAnnotation>,
    @InjectModel(UserAnnotationType.RUBBER_STAMP) private readonly rubberStampModel: Model<IRubberStamp>,
  ) {}

  public async countAnnotByOwnerAndType({ ownerId, type }: {ownerId: string, type: UserAnnotationType}): Promise<number> {
    const count = await this.userAnnotationModel.countDocuments({ ownerId, type });
    return count;
  }

  public async getAnnotations(
    ownerId: string,
    { skip, limit, type }: GetUserAnnotationInput,
  ): Promise<GetUserAnnotationResponse> {
    const [data, total] = await Promise.all([
      this.userAnnotationModel.find({ ownerId, type }).skip(skip).limit(limit),
      this.countAnnotByOwnerAndType({ ownerId, type }),
    ]);
    return { data: data as unknown as UserAnnotation[], total };
  }

  public async createUserAnnotation({
    ownerId,
    annotation,
  }: {
    annotation: CreateUserAnnotationInput;
    ownerId: string;
  }): Promise<IUserAnnotation | null> {
    const { type, property } = annotation;
    const numberOfCreatedAnnotation = await this.countAnnotByOwnerAndType({ ownerId, type });
    if (numberOfCreatedAnnotation >= USER_ANNOTATION_LIMIT[type]) {
      throw GraphErrorException.BadRequest('Limit reached!');
    }
    // TODO: Refactor this to use a factory pattern when we have many types of annotations
    if (type !== UserAnnotationType.RUBBER_STAMP) {
      return null;
    }
    const currentLargestAnnot = await this.userAnnotationModel.findOne({ ownerId, type }).sort({ weight: 'desc' });
    return this.rubberStampModel.create({
      ownerId,
      type: UserAnnotationType.RUBBER_STAMP,
      weight: currentLargestAnnot ? currentLargestAnnot.weight + 1 : 0,
      property,
    });
  }

  public async updateUserAnnotationPosition({ data, ownerId }: {
    data: UpdateUserAnnotationPositionInput,
    ownerId: string,
  }): Promise<void> {
    const { sourceId, destinationId } = data;
    const sourceAnnotation = await this.userAnnotationModel.findOne({ _id: sourceId, ownerId });
    const destinationAnnotation = await this.userAnnotationModel.findOne({ _id: destinationId, ownerId });

    if (!sourceAnnotation || !destinationAnnotation) {
      throw GraphErrorException.NotFound('Source annotation or destination annotation not found');
    }

    if (sourceAnnotation._id.toString() === destinationAnnotation._id.toString()) {
      return;
    }

    await Promise.all([
      this.userAnnotationModel.updateMany({
        ownerId,
        weight: { $gt: sourceAnnotation.weight, $lte: destinationAnnotation.weight },
        type: sourceAnnotation.type,
      }, { $inc: { weight: -1 } }).exec(),
      this.userAnnotationModel.updateMany({
        ownerId,
        weight: { $gte: destinationAnnotation.weight, $lt: sourceAnnotation.weight },
        type: sourceAnnotation.type,
      }, { $inc: { weight: 1 } }).exec(),
    ]);

    await this.userAnnotationModel.findByIdAndUpdate(sourceAnnotation._id, {
      weight: destinationAnnotation.weight,
    }).exec();
  }

  public async removeUserAnnotation({ id, ownerId }: {id: string; ownerId: string}): Promise<DeleteResult> {
    const annotation = await this.userAnnotationModel.findOne({
      _id: id,
      ownerId,
    });
    if (!annotation) {
      throw GraphErrorException.NotFound('The annotation is not yours to remove.');
    }
    await this.userAnnotationModel.updateMany({
      ownerId,
      type: annotation.type,
      weight: { $gt: annotation.weight },
    }, { $inc: { weight: -1 } }).exec();
    return this.userAnnotationModel.deleteOne({ _id: id }).exec();
  }
}

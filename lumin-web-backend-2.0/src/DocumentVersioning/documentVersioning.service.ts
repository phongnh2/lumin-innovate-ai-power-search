import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { AwsDocumentVersioningService } from 'Aws/aws.document-versioning.service';

import { DocumentStorageEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { LoggerService } from 'Logger/Logger.service';
import planPoliciesHandler, {
  IPlanRules,
} from 'Payment/Policy/planPoliciesHandler';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { DocumentVersioningType, IDocumentVersion } from './interfaces/documentVersion.interface';

@Injectable()
export class DocumentVersioningService {
  constructor(
    @InjectModel('DocumentVersioning')
    private readonly documentVersioningModel: Model<DocumentVersioningType>,
    private readonly userService: UserService,
    private readonly awsDocumentVersioningService: AwsDocumentVersioningService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly loggerService: LoggerService,
  ) {}

  private async getUserData(userId: string | Types.ObjectId): Promise<Partial<User>> {
    const modifier = await this.userService.findUserById(userId, {
      _id: 1,
      name: 1,
      createdAt: 1,
      email: 1,
    });
    return modifier;
  }

  async createVersion(
    documentId: Types.ObjectId,
    data: Omit<IDocumentVersion, 'documentId'>,
    config?: { isOriginal?: boolean },
  ): Promise<IDocumentVersion> {
    if (config?.isOriginal) {
      return (await this.documentVersioningModel.create({
        documentId,
        createdAt: Date.now(),
        expireAt: null,
        isOriginal: true,
        ...data,
      })).toObject();
    }
    return (await this.documentVersioningModel.create({
      documentId,
      createdAt: Date.now(),
      ...data,
    })).toObject();
  }

  private async getPaymentRules(
    documentId: string,
  ): Promise<IPlanRules['documentVersioning']> {
    const document = await this.documentService.getDocumentByDocumentId(
      documentId,
      {
        ownerId: 1,
        _id: 1,
        isPersonal: 1,
        size: 1,
        service: 1,
        mimeType: 1,
      },
    );
    if (!document) {
      throw GraphErrorException.NotFound('Document not found');
    }
    const payment = await this.documentService.getPaymentInfoOfDocument(
      document,
    );
    return planPoliciesHandler
      .from({ plan: payment.type, period: payment.period })
      .getDocumentVersioningRules();
  }

  public async getVersionList(documentId: Types.ObjectId) {
    const planRules = await this.getPaymentRules(String(documentId));
    const { quantity: limit } = planRules;
    const versions = await this.documentVersioningModel.aggregate([
      { $match: { documentId } },
      {
        $lookup: {
          from: 'users',
          localField: 'modifiedBy',
          foreignField: '_id',
          as: 'modifiedBy',
        },
      },
      { $unwind: '$modifiedBy' },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
    ]).exec();
    return {
      data: versions,
    };
  }

  async getVersionById(versionId: Types.ObjectId) {
    const foundVersion = await this.documentVersioningModel.findById(versionId).exec();
    return foundVersion;
  }

  async getVersion({
    documentId,
    versionId,
  }: {
    documentId: string;
    versionId: string;
  }) {
    const foundVersion = (await this.documentVersioningModel.findById(versionId)).toObject();
    if (!foundVersion) {
      throw GraphErrorException.NotFound(
        'The requested document version could not be found.',
        ErrorCode.Common.NOT_FOUND,
      );
    }

    if (String(foundVersion.documentId) !== documentId) {
      throw GraphErrorException.Unauthorized(
        'You do not have permission to access this resource.',
        ErrorCode.Common.NO_PERMISSION,
      );
    }

    return { data: foundVersion };
  }

  async retrieveLatestVersion(documentId: Types.ObjectId): Promise<DocumentVersioningType> {
    const latestVersion = await this.documentVersioningModel
      .findOne({ documentId }, { versionId: 1, annotationPath: 1 })
      .sort({ createdAt: -1 })
      .exec();
    return latestVersion;
  }

  async createVersionData({
    userId,
    documentId,
    versionId,
    annotationPath,
  }: {
    userId: string | Types.ObjectId;
    documentId: Types.ObjectId;
    versionId?: string;
    annotationPath?: string;
  }): Promise<{
    data?: IDocumentVersion;
  }> {
    const modifier = await this.getUserData(userId);
    if (!modifier) {
      throw HttpErrorException.NotFound(`The user could not be found: ${String(userId)}`);
    }

    if (!versionId && !annotationPath) {
      throw HttpErrorException.BadRequest(
        'You must provide either a versionId or an annotationPath.',
      );
    }

    const versionData = {
      documentId,
      versionId,
      modifiedBy: new Types.ObjectId(modifier._id),
      createdAt: new Date(),
      annotationPath,
    };

    const docVersion = await this.createVersion(documentId, versionData);

    return {
      data: docVersion,
    };
  }

  async createVersionFromAnnotChange({
    userId,
    documentId,
    annotationPath,
    versionId,
  }: {
    userId: string | Types.ObjectId;
    documentId: Types.ObjectId;
    annotationPath: string;
    versionId: string;
  }) {
    const documentInfo = await this.documentService.findOneById(String(documentId));
    if (!documentInfo) {
      throw HttpErrorException.NotFound('Document not found');
    }
    if (documentInfo.service !== DocumentStorageEnum.S3) {
      this.loggerService.error({
        extraInfo: {
          documentId,
          documentService: documentInfo.service,
        },
        context: 'DocumentVersioning',
      });
      throw HttpErrorException.BadRequest('Document storage not support');
    }
    const numberOfVersions = await this.documentVersioningModel.countDocuments({ documentId });

    if (numberOfVersions === 0) {
      await this.createVersionData({
        userId,
        documentId,
        versionId,
      });
    }

    this.createVersionData({
      userId,
      documentId,
      versionId,
      annotationPath,
    });
  }

  async createVersionFromFileContentChange({
    userData,
    documentId,
  }: {
    userData: Types.ObjectId | Partial<User>;
    documentId: Types.ObjectId;
  }) {
    const documentInfo = await this.documentService.findOneById(String(documentId));
    if (!documentInfo) {
      throw HttpErrorException.NotFound('Document not found');
    }
    const [documentVersions, numberOfVersions] = await Promise.all([
      this.awsDocumentVersioningService.getRecentDocumentFileVersions(documentInfo.remoteId),
      this.documentVersioningModel.countDocuments({ documentId }),
    ]);

    const [currentVersion, nearestCurrentVersion] = documentVersions || [];

    if (numberOfVersions === 0) {
      await this.createVersionData({
        userId: userData._id,
        documentId,
        versionId: nearestCurrentVersion?.VersionId,
      });
    }

    this.createVersionData({
      userId: userData._id,
      documentId,
      versionId: currentVersion?.VersionId,
    });
  }

  async createOriginalVersion({ documentRemoteId, versionId, userId }: {documentRemoteId: string, versionId: string, userId: Types.ObjectId}) {
    const document = await this.documentService.getDocumentByRemoteId(documentRemoteId, String(userId));
    if (!document) {
      return {
        error: GraphErrorException.NotFound('Document not found'),
      };
    }
    const versionData = {
      documentId: document._id,
      versionId,
      modifiedBy: userId,
    };
    const docVersion = await this.createVersion(new Types.ObjectId(document._id), versionData, { isOriginal: true });
    return {
      data: docVersion,
      error: null,
    };
  }
}

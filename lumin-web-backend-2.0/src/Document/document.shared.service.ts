import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession, Model, ProjectionType, Types, UpdateQuery,
} from 'mongoose';

import { IDocument, IDocumentModel } from './interfaces/document.interface';

@Injectable()
export class DocumentSharedService {
  constructor(
    @InjectModel('Document')
    private readonly documentModel: Model<IDocumentModel>,
  ) {}

  async updateDocument(
    documentId: string | Types.ObjectId,
    updatedProperties: UpdateQuery<IDocument>,
    session: ClientSession = null,
  ): Promise<IDocument | null> {
    const updatedDocument = await this.documentModel.findOneAndUpdate(
      { _id: documentId },
      {
        $set: {
          ...updatedProperties,
        },
      },
      { new: true },
    ).session(session).exec();
    return updatedDocument ? { ...updatedDocument.toObject(), _id: updatedDocument._id.toHexString() } : null;
  }

  async getDocumentByDocumentId(documentId: string, projection?: ProjectionType<IDocument>): Promise<IDocument | null> {
    const document = await this.documentModel.findOne({ _id: documentId }, projection).exec();
    return document ? { ...document.toObject(), _id: document._id.toHexString() } : null;
  }
}

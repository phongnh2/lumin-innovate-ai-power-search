/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-use-before-define */
/* eslint-disable lines-between-class-members */
/* eslint-disable max-classes-per-file */
import { omit } from 'lodash';
import { Types } from 'mongoose';

import { BaseDocumentFilter } from 'Common/builder/DocumentFilterBuilder/base-document-filter';
import {
  IDocumentFilterBuilder,
  IDocumentFilter,
} from 'Common/builder/DocumentFilterBuilder/document-filter-builder.interface';

import { DocumentService } from 'Document/document.service';
import {
  DocumentFilterInput, DocumentTab, LastModifiedFilterCondition, OwnedFilterCondition,
} from 'graphql.schema';

type DocumentQueryResult = {
  filter: IDocumentFilter,
  // strip out lastAccess filter
  countTotalFilter: Omit<IDocumentFilter, '$or'>
}

abstract class AbstractDocumentFilter<T> {
  abstract addTab(tab: DocumentTab): T;
  abstract addSearch(searchKey?: string): T;
  abstract addCursor(cursor?: string): T;
  abstract addFilter(filter: DocumentFilterInput): T;
}

class DocumentFilter extends BaseDocumentFilter implements AbstractDocumentFilter<DocumentFilter>, IDocumentFilterBuilder<DocumentQueryResult> {
  protected _filter: IDocumentFilter = { };

  constructor(
    protected readonly _documentService: DocumentService,
  ) {
    super();
    this._filter.folderId = { $exists: false };
    this._filter.kind = { $exists: false };
  }

  async build(): Promise<DocumentQueryResult> {
    await Promise.all(this._asyncQueue.map((func) => func()));
    return {
      filter: this._filter,
      countTotalFilter: omit(this._filter, '$or'),
    };
  }

  addTab(tab: DocumentTab): this {
    switch (tab) {
      case DocumentTab.STARRED:
        this._filter.listUserStar = { $eq: this._user._id };
        delete this._filter.folderId;
        break;
      case DocumentTab.SHARED_WITH_ME:
      case DocumentTab.TRENDING:
        delete this._filter.folderId;
        break;
      default:
        break;
    }

    return this;
  }

  addCursor(cursor?: string): this {
    if (cursor) {
      const { lastAccessCursor, documentIdCursor } = this._documentService.splitDocumentCursor(cursor);
      Object.assign(this._filter, {
        $or: [
          { lastAccess: { $lt: lastAccessCursor } },
          { lastAccess: lastAccessCursor, _id: { $lt: documentIdCursor } },
        ],
      });
    }
    return this;
  }

  addSearch(searchKey?: string): this {
    if (searchKey) {
      const searchKeyRegex = this._documentService.generateSearchDocumentKeyRegex(searchKey.normalize('NFD'));
      this._filter.name = { $regex: searchKeyRegex };
      delete this._filter.folderId;
    }

    return this;
  }

  addFilter({ ownedFilterCondition: owned, lastModifiedFilterCondition: lastModified }: DocumentFilterInput): this {
    const userId = new Types.ObjectId(this._user._id);
    switch (owned) {
      case OwnedFilterCondition.BY_ME:
        this._filter.ownerId = userId;
        break;
      case OwnedFilterCondition.NOT_BY_ME:
        this._filter.ownerId = {
          $ne: userId,
        };
        break;
      default:
        break;
    }
    if (lastModified === LastModifiedFilterCondition.MODIFIED_BY_ME) {
      this._filter.lastModifiedBy = userId;
    }
    return this;
  }
}

export { DocumentFilter };

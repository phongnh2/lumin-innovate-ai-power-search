/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-use-before-define */
/* eslint-disable lines-between-class-members */
/* eslint-disable max-classes-per-file */
import { FilterQuery } from 'mongoose';

import { BaseDocumentFilter } from 'Common/builder/DocumentFilterBuilder/base-document-filter';
import {
  IDocumentFilterBuilder,
} from 'Common/builder/DocumentFilterBuilder/document-filter-builder.interface';

import { IDocumentTemplate } from 'Document/DocumentTemplate/documentTemplate.interface';
import { DocumentTemplateService } from 'Document/DocumentTemplate/documentTemplate.service';
import { DocumentTab } from 'graphql.schema';

export type IDocumentTemplateFilter = FilterQuery<IDocumentTemplate>;

export type DocumentTemplateQueryResult = {
  filter: IDocumentTemplateFilter,
}

abstract class AbstractDocumentTemplateFilter<T> {
  abstract addTab(tab: DocumentTab): T;
  abstract addSearch(searchKey?: string): T;
  abstract addCursor(cursor?: string): T;
  abstract addTemplateId(templateId: string): T;
}

class DocumentTemplateFilter extends BaseDocumentFilter
  implements AbstractDocumentTemplateFilter<DocumentTemplateFilter>, IDocumentFilterBuilder<DocumentTemplateQueryResult> {
  protected _filter: IDocumentTemplateFilter = {};

  constructor(
    protected readonly _documentTemplateService: DocumentTemplateService,
  ) {
    super();
  }

  async build(): Promise<DocumentTemplateQueryResult> {
    await Promise.all(this._asyncQueue.map((func) => Promise.resolve(func())));
    return {
      filter: this._filter,
    };
  }

  addTab(tab: DocumentTab): this {
    if (![DocumentTab.MY_DOCUMENT, DocumentTab.ORGANIZATION, DocumentTab.ACCESSIBLE].includes(tab)) {
      throw new Error(`The document template tab - ${tab} is not supported.`);
    }

    return this;
  }

  addCursor(cursor?: string): this {
    if (cursor) {
      const { lastAccessCursor, documentIdCursor } = this._documentTemplateService.splitDocumentCursor(cursor);
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
      const searchKeyRegex = this._documentTemplateService.generateSearchDocumentKeyRegex(searchKey.normalize('NFD'));
      this._filter.name = { $regex: searchKeyRegex };
    }

    return this;
  }

  addTemplateId(templateId: string): this {
    if (templateId) {
      this._filter._id = templateId;
    }
    return this;
  }
}

export { DocumentTemplateFilter };

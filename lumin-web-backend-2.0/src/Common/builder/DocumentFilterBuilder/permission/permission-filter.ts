/* eslint-disable max-classes-per-file */
import { BaseDocumentFilter } from 'Common/builder/DocumentFilterBuilder/base-document-filter';
import {
  IDocumentFilterBuilder,
  IDocumentPermissionFilter,
} from 'Common/builder/DocumentFilterBuilder/document-filter-builder.interface';

import { DocumentKindEnum } from 'Document/document.enum';
import { DocumentTab } from 'graphql.schema';

abstract class AbstractPermissionFilter<TInstance> {
  abstract addTab(tab: DocumentTab): TInstance;

  abstract addKind(kind: DocumentKindEnum): TInstance;
}

class PermissionFilter extends BaseDocumentFilter implements IDocumentFilterBuilder<IDocumentPermissionFilter> {
  protected _filter: IDocumentPermissionFilter = {
    documentKind: { $exists: false },
  };

  async build(): Promise<IDocumentPermissionFilter> {
    await Promise.all(this._asyncQueue.map((func) => Promise.resolve(func())));
    return this._filter;
  }
}

export { PermissionFilter, AbstractPermissionFilter };

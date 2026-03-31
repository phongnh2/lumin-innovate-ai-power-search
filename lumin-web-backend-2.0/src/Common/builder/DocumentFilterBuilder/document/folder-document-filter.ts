import { DocumentFilter } from 'Common/builder/DocumentFilterBuilder/document/document-filter';

import { DocumentService } from 'Document/document.service';
import { DocumentTab } from 'graphql.schema';

interface AbstractFolderDocumentFilter<T> {
  addFolder(folderId: string): T;
}

class FolderDocumentFilter extends DocumentFilter implements AbstractFolderDocumentFilter<DocumentFilter> {
  constructor(
    protected readonly _documentService: DocumentService,
  ) {
    super(_documentService);
  }

  addTab(_tab: DocumentTab): this {
    throw new Error('Method is not implemented!');
  }

  addFolder(folderId: string): this {
    this._filter.folderId = folderId;
    return this;
  }

  addFolders(folderIds: string[]): this {
    this._filter.folderId = { $in: folderIds };
    return this;
  }

  addSearch(searchKey?: string): this {
    if (searchKey) {
      const searchKeyRegex = this._documentService.generateSearchDocumentKeyRegex(searchKey);
      this._filter.name = { $regex: searchKeyRegex };
    }
    return this;
  }
}

export { FolderDocumentFilter };

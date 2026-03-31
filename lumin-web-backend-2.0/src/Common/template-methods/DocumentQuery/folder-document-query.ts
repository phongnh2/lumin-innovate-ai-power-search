import { DocumentQuery } from 'Common/template-methods/DocumentQuery/document-query';
import { FolderInterceptor, GetDocumentsResult, IDocumentQueryInput } from 'Common/template-methods/DocumentQuery/document-query.interface';
import { DocumentService } from 'Document/document.service';
import { EnvironmentService } from 'Environment/environment.service';
import { FolderService } from 'Folder/folder.service';
import { FolderPublicInfo } from 'graphql.schema';
import { UserService } from 'User/user.service';

class FolderDocumentQuery extends DocumentQuery {
  constructor(
    protected readonly _documentService: DocumentService,
    protected readonly _userService: UserService,
    protected readonly _folderService: FolderService,
    protected readonly _environmentService: EnvironmentService,
  ) {
    super(
      _documentService,
      _userService,
      _folderService,
      _environmentService,
    );
  }

  protected async findDocuments(params: IDocumentQueryInput): Promise<GetDocumentsResult> {
    const {
      query,
      documentFilter,
    } = params;
    const { minimumQuantity } = query;
    const [documents, totalDocument] = await Promise.all([
      this._documentService.getDocumentsInFolderPagination({
        matchConditions: documentFilter.filter, minimumQuantity: minimumQuantity + 1,
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this._documentService.countTotalDocuments(documentFilter.countTotalFilter),
    ]);

    return {
      documents, totalDocument,
    };
  }

  protected interceptFolderData({ folder }: FolderInterceptor): FolderPublicInfo {
    return {
      ...folder,
      canOpen: true,
    };
  }
}

export { FolderDocumentQuery };

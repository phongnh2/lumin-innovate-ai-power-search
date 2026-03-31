import { DocumentQuery } from 'Common/template-methods/DocumentQuery/document-query';
import { FolderInterceptor } from 'Common/template-methods/DocumentQuery/document-query.interface';
import { DocumentService } from 'Document/document.service';
import { EnvironmentService } from 'Environment/environment.service';
import { FolderService } from 'Folder/folder.service';
import { FolderPublicInfo } from 'graphql.schema';
import { UserService } from 'User/user.service';

class OrganizationDocumentQuery extends DocumentQuery {
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

  protected interceptFolderData({ folder }: FolderInterceptor): FolderPublicInfo {
    return folder && {
      ...folder,
      canOpen: true,
    };
  }
}

export { OrganizationDocumentQuery };

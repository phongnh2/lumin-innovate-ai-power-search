import { DocumentQuery } from 'Common/template-methods/DocumentQuery/document-query';
import { DocumentService } from 'Document/document.service';
import { FolderService } from 'Folder/folder.service';
import { UserService } from 'User/user.service';
import { EnvironmentService } from 'Environment/environment.service';
import { FolderInterceptor } from 'Common/template-methods/DocumentQuery/document-query.interface';
import { FolderPublicInfo } from 'graphql.schema';

class PersonalDocumentQuery extends DocumentQuery {
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

  protected interceptFolderData(payload: FolderInterceptor): FolderPublicInfo {
    const { folder, document } = payload;
    return folder && {
      ...folder,
      canOpen: document.isPersonal && document.folderId && document.ownerId.toHexString() === this._user._id,
    };
  }
}

export { PersonalDocumentQuery };

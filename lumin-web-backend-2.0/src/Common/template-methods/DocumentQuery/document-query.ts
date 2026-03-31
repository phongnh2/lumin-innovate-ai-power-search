/* eslint-disable max-classes-per-file */
import { DocumentPremiumMap } from 'Common/template-methods/DocumentPremiumMap';
import {
  FolderAndOwnerMap, FolderInterceptor, GetDocumentsResult, IDocumentQueryInput,
} from 'Common/template-methods/DocumentQuery/document-query.interface';

import { DocumentKindEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { IDocument } from 'Document/interfaces/document.interface';
import { EnvironmentService } from 'Environment/environment.service';
import { FolderService } from 'Folder/folder.service';
import {
  Document, FolderPublicInfo, GetDocumentPayload, ShareLinkType,
} from 'graphql.schema';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

abstract class AbstractDocumentQuery {
  protected abstract findDocuments(params: IDocumentQueryInput): Promise<GetDocumentsResult>;

  protected abstract interceptFolderData(payload: FolderInterceptor): FolderPublicInfo;
}

class DocumentQuery extends AbstractDocumentQuery {
  protected _premiumMap: DocumentPremiumMap;

  protected _user: User;

  protected _resource: IOrganization | ITeam;

  constructor(
    protected readonly _documentService: DocumentService,
    protected readonly _userService: UserService,
    protected readonly _folderService: FolderService,
    protected readonly _environmentService: EnvironmentService,
  ) {
    super();
  }

  of(user: User): this {
    this._user = user;
    return this;
  }

  in(resource: IOrganization | ITeam): this {
    this._resource = resource;
    return this;
  }

  protected interceptFolderData(_payload: FolderInterceptor): FolderPublicInfo {
    throw new Error('Method not implemented.');
  }

  private async buildFolderAndOwnerMap(documents: IDocument[]): Promise<FolderAndOwnerMap> {
    const ownerIds = new Set();
    const folderIds = new Set();
    documents.forEach((document) => {
      ownerIds.add(document.ownerId.toHexString());
      if (document.folderId) {
        folderIds.add(document.folderId);
      }
    });
    const [ownerList, folderList] = await Promise.all([
      this._userService.findUserByIds([...ownerIds] as string[], {
        name: 1,
        avatarRemoteId: 1,
        payment: 1,
      }),
      this._folderService.findFolderByIds([...folderIds] as string[]),
    ]);
    const ownerListData = ownerList.map(
      (ownerDoc) => [ownerDoc._id, ownerDoc] as [string, FolderAndOwnerMap['ownerMap'][keyof FolderAndOwnerMap['ownerMap']]],
    );
    const ownerMap = Object.fromEntries(ownerListData);
    const folderMap = Object.fromEntries(
      folderList.map((folder) => [folder._id, folder]),
    );
    return {
      folderMap,
      ownerMap,
    };
  }

  protected async findDocuments(params: IDocumentQueryInput): Promise<GetDocumentsResult> {
    const {
      query,
      permFilter,
      documentFilter,
    } = params;
    const { minimumQuantity } = query;

    if (!permFilter || Object.keys(permFilter).length === 0) {
      throw new Error('Missing permission filter for document query!');
    }

    const documentPermissions = await this._documentService.getDocumentPermissionInBatch(permFilter, {
      documentId: 1,
    });

    const [documents, totalDocument] = await Promise.all([
      this._documentService.getDocumentInPermissionPagination(
        documentPermissions.map((docPer) => docPer.documentId),
        documentFilter.filter,
        minimumQuantity + 1,
      ),
      this._documentService.countTotalDocumentByIds({
        documentIds: documentPermissions.map((docPer) => docPer.documentId),
        conditions: documentFilter.countTotalFilter,
        options: { hint: { _id: 1 } },
      }),
    ]);

    return {
      documents, totalDocument,
    };
  }

  injectPremiumMap(map: DocumentPremiumMap): this {
    this._premiumMap = map;
    return this;
  }

  async getDocuments(params: IDocumentQueryInput): Promise<GetDocumentPayload> {
    const {
      query,
    } = params;
    if (!this._user) {
      throw new Error('User is not initialized!');
    }
    const { minimumQuantity } = query;
    const { documents, totalDocument } = await this.findDocuments(params);
    const queryDocuments = documents.slice(0, minimumQuantity);
    const { ownerMap, folderMap } = await this.buildFolderAndOwnerMap(queryDocuments);
    const premiumMap = await this._premiumMap.get({
      documents,
      ownerMap,
    });
    const returnDocuments = await Promise.all(queryDocuments.map((document) => {
      const owner = ownerMap[document.ownerId];
      const folder = folderMap[document.folderId];
      const folderData = this.interceptFolderData({
        folder,
        document,
      });
      const isUsingPremium = premiumMap[document._id];
      const isOverTimeLimit = document.shareSetting.linkType !== ShareLinkType.ANYONE
        && document.kind !== DocumentKindEnum.TEMPLATE
        && this._documentService.isOverTimeLimit(document.createdAt);
      return ({
        ...document,
        isOverTimeLimit: !isUsingPremium && isOverTimeLimit,
        ownerName: owner?.name || 'Anonymous',
        ownerAvatarRemoteId: owner?.avatarRemoteId || '',
        folderData,
      });
    }));

    const newCursor = this._documentService.generateDocumentCursor(returnDocuments as Partial<IDocument>[]);
    return {
      documents: returnDocuments as unknown as Document[],
      cursor: newCursor,
      hasNextPage: documents.length === minimumQuantity + 1,
      total: totalDocument || 0,
    };
  }
}

export { DocumentQuery };

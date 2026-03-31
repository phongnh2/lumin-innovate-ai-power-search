/* eslint-disable max-classes-per-file */
import { DocumentTemplateQueryResult } from 'Common/builder/DocumentFilterBuilder/document/document-template-filter';
import { IDocumentPermissionFilter } from 'Common/builder/DocumentFilterBuilder/document-filter-builder.interface';
import { DocumentPremiumMap } from 'Common/template-methods/DocumentPremiumMap';

import { DocumentTemplateService } from 'Document/DocumentTemplate/documentTemplate.service';
import { IDocument } from 'Document/interfaces/document.interface';
import { EnvironmentService } from 'Environment/environment.service';
import { Document, DocumentQueryInput, GetDocumentTemplatesPayload } from 'graphql.schema';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

export type IDocumentTemplateQueryInput = {
  query: DocumentQueryInput;
  permFilter: IDocumentPermissionFilter;
  documentFilter: DocumentTemplateQueryResult;
}

export type GetDocumentTemplatesResult = {
  documents: IDocument[];
}

abstract class AbstractDocumentTemplateQuery {
  protected abstract findDocuments(params: IDocumentTemplateQueryInput): Promise<GetDocumentTemplatesResult>;
}

class DocumentTemplateQuery extends AbstractDocumentTemplateQuery {
  protected _premiumMap: DocumentPremiumMap;

  protected _user: User;

  protected _resource: IOrganization | ITeam;

  constructor(
    protected readonly _documentTemplateService: DocumentTemplateService,
    protected readonly _userService: UserService,
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

  private async buildOwnerMap(documents: IDocument[]): Promise<Record<string, User>> {
    const ownerIds = new Set();
    documents.forEach((document) => {
      ownerIds.add(document.ownerId.toHexString());
    });
    const ownerList = await this._userService.findUserByIds([...ownerIds] as string[], {
      name: 1,
      avatarRemoteId: 1,
      payment: 1,
    });
    const ownerListData = ownerList.map(
      (ownerDoc) => [ownerDoc._id, ownerDoc] as [string, User],
    );
    const ownerMap = Object.fromEntries(ownerListData);
    return ownerMap;
  }

  protected async findDocuments(params: IDocumentTemplateQueryInput): Promise<GetDocumentTemplatesResult> {
    const {
      query,
      permFilter,
      documentFilter,
    } = params;
    const { minimumQuantity } = query;

    if (!permFilter || Object.keys(permFilter).length === 0) {
      throw new Error('Missing permission filter for document query!');
    }

    const documentPermissions = await this._documentTemplateService.getDocumentPermissionInBatch(permFilter, {
      documentId: 1,
    });

    const documents = await this._documentTemplateService.getDocumentInPermissionPagination(
      documentPermissions.map((docPer) => docPer.documentId),
      documentFilter.filter,
      minimumQuantity + 1,
    );

    return {
      documents,
    };
  }

  injectPremiumMap(map: DocumentPremiumMap): this {
    this._premiumMap = map;
    return this;
  }

  async getDocuments(params: IDocumentTemplateQueryInput): Promise<GetDocumentTemplatesPayload> {
    const {
      query,
    } = params;
    if (!this._user) {
      throw new Error('User is not initialized!');
    }
    const { minimumQuantity } = query;
    const { documents } = await this.findDocuments(params);
    const queryDocuments = documents.slice(0, minimumQuantity);
    const ownerMap = await this.buildOwnerMap(queryDocuments);
    const returnDocuments = queryDocuments.map((document) => {
      const owner = ownerMap[document.ownerId];
      return ({
        ...document,
        ownerName: owner?.name || 'Anonymous',
        ownerAvatarRemoteId: owner?.avatarRemoteId || '',
      });
    });

    const newCursor = this._documentTemplateService.generateDocumentCursor(returnDocuments as Partial<IDocument>[]);
    return {
      documents: returnDocuments as unknown as Document[],
      cursor: newCursor,
      hasNextPage: documents.length === minimumQuantity + 1,
    };
  }

  async getAccessibleDocuments(
    params: Pick<IDocumentTemplateQueryInput, 'documentFilter' | 'permFilter'>,
  ): Promise<Pick<GetDocumentTemplatesPayload, 'documents'>> {
    if (!this._user) {
      throw new Error('User is not initialized!');
    }
    const { permFilter, documentFilter } = params;
    if (!permFilter || Object.keys(permFilter).length === 0) {
      throw new Error('Missing permission filter for document query!');
    }

    const documentPermissions = await this._documentTemplateService.getDocumentPermissionInBatch(permFilter, {
      documentId: 1,
    });

    const documents = await this._documentTemplateService.getDocumentInPermissionPagination(
      documentPermissions.map((docPer) => docPer.documentId),
      documentFilter.filter,
      0,
    );

    return { documents };
  }
}

export { DocumentTemplateQuery };

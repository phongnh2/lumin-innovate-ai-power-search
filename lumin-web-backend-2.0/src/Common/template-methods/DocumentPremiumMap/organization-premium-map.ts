import { DocumentPremiumMap, IsUsingPremium } from 'Common/template-methods/DocumentPremiumMap/document-premium-map';
import { PremiumDocumentMap } from 'Common/template-methods/DocumentQuery/document-query.interface';

import { DocumentService } from 'Document/document.service';
import { DocumentTab } from 'graphql.schema';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationService } from 'Organization/organization.service';
import { ITeam } from 'Team/interfaces/team.interface';

class OrganizationDocumentPremiumMap extends DocumentPremiumMap {
  private _resource: IOrganization | ITeam;

  constructor(
    private readonly _documentService: DocumentService,
    private readonly _organizationService: OrganizationService,
  ) {
    super();
  }

  ofResource(resource: IOrganization | ITeam): this {
    this._resource = resource;
    return this;
  }

  protected personal(_params: IsUsingPremium): Promise<PremiumDocumentMap> {
    throw new Error('Method not implemented.');
  }

  protected async organization({ documents }: IsUsingPremium): Promise<PremiumDocumentMap> {
    const isFree = await this._organizationService.isFreeResource(this._resource);

    return documents.reduce((acc, doc) => {
      acc[doc._id] = !isFree;
      return acc;
    }, {});
  }

  protected async starred(params: IsUsingPremium): Promise<PremiumDocumentMap> {
    const { documents, ownerMap } = params;
    const sharedDocumentMap = await this.shared(params);
    const sharedDocumentIds = Object.keys(sharedDocumentMap);
    const remainingDocuments = documents.filter((doc) => !sharedDocumentIds.includes(doc._id));

    const normalDocumentMap = await this.organization({ ownerMap, documents: remainingDocuments });
    return {
      ...normalDocumentMap,
      ...sharedDocumentMap,
    };
  }

  protected async shared({ documents }: IsUsingPremium): Promise<PremiumDocumentMap> {
    return this._documentService.getDocumentLimitMapping(documents);
  }

  get(params: IsUsingPremium): Promise<PremiumDocumentMap> {
    switch (this._tab) {
      case DocumentTab.MY_DOCUMENT:
      case DocumentTab.ORGANIZATION:
      case DocumentTab.TRENDING:
        return this.organization(params);
      case DocumentTab.SHARED_WITH_ME:
        return this.shared(params);
      case DocumentTab.STARRED:
        return this.starred(params);
      default:
        throw new Error('Not valid tab.');
    }
  }
}

export { OrganizationDocumentPremiumMap };

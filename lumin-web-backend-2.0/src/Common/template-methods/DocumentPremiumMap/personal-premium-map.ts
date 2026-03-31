import { DocumentPremiumMap, IsUsingPremium } from 'Common/template-methods/DocumentPremiumMap/document-premium-map';
import { PremiumDocumentMap } from 'Common/template-methods/DocumentQuery/document-query.interface';
import { DocumentService } from 'Document/document.service';
import { UserService } from 'User/user.service';
import { DocumentTab } from 'graphql.schema';
import { User } from 'User/interfaces/user.interface';

class PersonalDocumentPremiumMap extends DocumentPremiumMap {
  constructor(
    private readonly _userService: UserService,
    private readonly _documentService: DocumentService,
  ) {
    super();
  }

  protected organization(_params: IsUsingPremium): Promise<PremiumDocumentMap> {
    throw new Error('Method not implemented.');
  }

  protected async personal({ documents, ownerMap }: IsUsingPremium): Promise<PremiumDocumentMap> {
    const ownerIds = [...new Set(documents.map((doc) => doc.ownerId.toHexString()))];
    const checkPremium = async (owner: User): Promise<[string, boolean]> => {
      if (!owner) {
        return null;
      }
      const isPremium = await this._userService.isAvailableUsePremiumFeature(owner);
      return [owner._id, isPremium];
    };
    const owners = (await Promise.all(
      ownerIds.map((ownerId) => checkPremium(ownerMap[ownerId])),
    )).filter(Boolean);
    const ownerPremiumMap = Object.fromEntries(owners);
    const documentEntries = documents.map((doc) => [doc._id, ownerPremiumMap[doc.ownerId]] as [string, boolean]);
    return Object.fromEntries(documentEntries);
  }

  protected async starred(params: IsUsingPremium): Promise<PremiumDocumentMap> {
    const { documents, ownerMap } = params;
    const sharedDocumentMap = await this.shared(params);
    const sharedDocumentIds = Object.keys(sharedDocumentMap);
    const remainingDocuments = documents.filter((doc) => !sharedDocumentIds.includes(doc._id));

    const normalDocumentMap = await this.personal({ ownerMap, documents: remainingDocuments });
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
        return this.personal(params);
      case DocumentTab.SHARED_WITH_ME:
        return this.shared(params);
      case DocumentTab.STARRED:
        return this.starred(params);
      default:
        throw new Error('Not valid tab.');
    }
  }
}

export { PersonalDocumentPremiumMap };

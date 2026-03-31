import { PremiumDocumentMap } from 'Common/template-methods/DocumentQuery/document-query.interface';
import { IDocument } from 'Document/interfaces/document.interface';
import { DocumentTab } from 'graphql.schema';
import { User } from 'User/interfaces/user.interface';

type IsUsingPremium = {
  ownerMap: Record<string, User>,
  documents: IDocument[],
}

abstract class DocumentPremiumMap {
  protected _tab: DocumentTab;

  protected abstract personal(params: IsUsingPremium): Promise<PremiumDocumentMap>;

  protected abstract organization(params: IsUsingPremium): Promise<PremiumDocumentMap>;

  protected abstract starred(params: IsUsingPremium): Promise<PremiumDocumentMap>;

  protected abstract shared(params: IsUsingPremium): Promise<PremiumDocumentMap>;

  abstract get(params: IsUsingPremium): Promise<PremiumDocumentMap>;

  atTab(tab: DocumentTab): this {
    this._tab = tab;
    return this;
  }
}

export { DocumentPremiumMap, IsUsingPremium };

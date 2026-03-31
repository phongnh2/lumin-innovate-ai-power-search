import { TFunction } from 'i18next';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

export declare function getToolChecker(params: {
  toolName: string;
  currentUser: IUser;
  currentDocument: IDocumentBase;
  translator: TFunction;
  featureName?: string;
}): {
  isToolAvailable: boolean;
  shouldShowPremiumIcon: boolean;
  validateType?: string;
  toolPlanRequirements?: string;
};

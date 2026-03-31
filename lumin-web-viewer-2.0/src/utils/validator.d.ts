import { AppFeaturesType } from 'features/FeatureConfigs/featureStoragePolicies';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { IUser } from 'interfaces/user/user.interface';

declare namespace validator {
  function validateDomainEducation(email: string): boolean;

  function validatePremiumOrganization(currentOrganization: Partial<IOrganization>): boolean;

  function validateEmailByDomains(email: string, domainList: string[]): boolean;

  function validateEmail(email: string): boolean;

  function validateInputPages(pageNumber: number): boolean;

  function isEmail(email: string): boolean;

  function getValidMergeFileSize(document: IDocumentBase): number;

  function validateNameUrl(value: string): boolean;

  function validateNameHtml(value: string): boolean;

  function validateFeature({
    currentUser,
    currentDocument,
    toolName,
    currentMergeSize,
    featureName,
  }: {
    currentUser: IUser;
    currentDocument: IDocumentBase;
    toolName: string;
    currentMergeSize?: number;
    featureName?: AppFeaturesType;
  }): string;

  function validateDocumentName(value: string): {
    isValidated: boolean;
    error: string | null;
  };

  function validateWhitelistUrl(url: string): boolean;
}

export default validator;

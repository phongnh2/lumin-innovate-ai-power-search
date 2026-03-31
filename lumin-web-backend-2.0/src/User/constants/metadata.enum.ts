import { UserMetadataEnums } from 'graphql.schema';

export const NON_REVERSIBLE_METADATA = [
  UserMetadataEnums.hasShownSharePrompt,
  UserMetadataEnums.hasShownEditInAgreementGenModal,
  UserMetadataEnums.hasShowOnboardingFlowFromOpenGoogle,
  UserMetadataEnums.hasShownTourGuide,
  UserMetadataEnums.hasShownAutoSyncModal,
  UserMetadataEnums.hasShownAutoSyncDefault,
  UserMetadataEnums.hasShownEditFileOfflinePopover,
  UserMetadataEnums.hasShownContentEditPopover,
  UserMetadataEnums.hasClosedQuickSearchGuideline,
];

export const USER_UPDATABLE_METADATA = [
  UserMetadataEnums.hasShownSharePrompt,
  UserMetadataEnums.hasShownEditInAgreementGenModal,
  UserMetadataEnums.hasShowOnboardingFlowFromOpenGoogle,
  UserMetadataEnums.hasShownAutoSyncModal,
  UserMetadataEnums.hasShownAutoSyncDefault,
  UserMetadataEnums.hasShownEditFileOfflinePopover,
  UserMetadataEnums.hasShownContentEditPopover,
  UserMetadataEnums.introduceNewLayout,
  UserMetadataEnums.isHiddenSuggestedOrganization,
  UserMetadataEnums.isUsingNewLayout,
  UserMetadataEnums.isUsingNewInAppLayout,
  UserMetadataEnums.introduceNewInAppLayout,
  UserMetadataEnums.isAgreementTourGuideVisible,
  UserMetadataEnums.hasClosedQuickSearchGuideline,
];

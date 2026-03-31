export const STANDARD_STAMP_HEIGHT_DEFAULT = 40;

export const RUBBER_STAMPS_MAXIMUM = 100;

export const RUBBER_STAMP_FOLDER_DEFAULT = 'assets/images/default-rubber-stamps';

export const ORIGINAL_URL_KEY = 'trn-original-url';

export const ORIGINAL_URL_CUSTOM_KEY = 'originalUrl';

export const POPPER_SCROLL_CN = 'rubber-stamp-popper-scroll';

export const RUBBER_STAMPS_EVENT_ELEMENT_NAME = {
  'sign-here': 'signHereStamp',
  'initial-here': 'initialHereStamp',
  paid: 'paidStamp',
  copy: 'copyStamp',
  'big-doc-energy': 'bigDocEnergyStamp',
  star: 'starStamp',
  cancel: 'crossStamp',
  check: 'tickStamp',
  witness: 'witnessStamp',
  approved: 'approvedStamp',
  'as-is': 'asIsStamp',
  completed: 'compteledStamp',
  departmental: 'departmentalStamp',
  experimental: 'experimentalStamp',
  final: 'finalStamp',
  'for-public-release': 'forPublicReleaseStamp',
  'not-for-public-release': 'notForPublicReleaseStamp',
  'preliminary-results': 'preliminaryResultsStamp',
  'top-secret': 'topSecretStamp',
  sold: 'soldStamp',
  void: 'voidStamp',
  'not-approved': 'notApprovedStamp',
  confidential: 'confidentialStamp',
  draft: 'draftStamp',
  expired: 'expiredStamp',
  'for-comment': 'forCommentStamp',
  'information-only': 'informationOnlyStamp',
};

// NOTE: please refer to assets/images/default-rubber-stamps
export const DEFAULT_RUBBER_STAMPS = [
  {
    name: 'Sign Here',
    src: 'sign-here',
  },
  {
    name: 'Inital Here',
    src: 'initial-here',
  },
  {
    name: 'Paid',
    src: 'paid',
  },
  {
    name: 'Copy',
    src: 'copy',
  },
  {
    name: 'Big Doc Energy',
    src: 'big-doc-energy',
  },
  {
    name: 'Star',
    src: 'star',
  },
  {
    name: 'Cancel',
    src: 'cancel',
  },
  {
    name: 'Check',
    src: 'check',
  },
  {
    name: 'Witness',
    src: 'witness',
  },
  {
    name: 'Approved',
    src: 'approved',
  },
  {
    name: 'As Is',
    src: 'as-is',
  },
  {
    name: 'Completed',
    src: 'completed',
  },
  {
    name: 'Departmental',
    src: 'departmental',
  },
  {
    name: 'Experimental',
    src: 'experimental',
  },
  {
    name: 'Final',
    src: 'final',
  },
  {
    name: 'For Public Release',
    src: 'for-public-release',
  },
  {
    name: 'Not For Public Release',
    src: 'not-for-public-release',
  },
  {
    name: 'Preliminary Results',
    src: 'preliminary-results',
  },
  {
    name: 'Top Secret',
    src: 'top-secret',
  },
  {
    name: 'Sold',
    src: 'sold',
  },
  {
    name: 'Void',
    src: 'void',
  },
  {
    name: 'Not Approved',
    src: 'not-approved',
  },
  {
    name: 'Confidential',
    src: 'confidential',
  },
  {
    name: 'Draft',
    src: 'draft',
  },
  {
    name: 'Expired',
    src: 'expired',
  },
  {
    name: 'For Comment',
    src: 'for-comment',
  },
  {
    name: 'Information Only',
    src: 'information-only',
  },
];

export const PLACE_MULTIPLE_STAMP_CHECKBOX_EVENT = {
  TYPE: 'checkboxUpdated',
  PARAMS: {
    checkboxName: 'placeStampMultipleTimes',
    checkboxPurpose: 'Place stamp multiple times',
  },
};

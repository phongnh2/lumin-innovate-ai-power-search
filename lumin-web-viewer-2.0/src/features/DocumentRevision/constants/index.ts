export const DescriptionContext = {
  SUPER: 'super',
  ADMIN: 'admin',
  MEMBER: 'member',
};

export const GOOGLE_DRIVE_VERSIONING_POLICY = {
  [DescriptionContext.SUPER]: {
    quantity: 100,
    maximumSaveTime: 30,
    maximumSaveTimeUnit: 'days',
  },
  [DescriptionContext.ADMIN]: {
    quantity: 5,
    maximumSaveTime: 30,
    maximumSaveTimeUnit: 'days',
  },
  [DescriptionContext.MEMBER]: {
    quantity: 5,
    maximumSaveTime: 30,
    maximumSaveTimeUnit: 'days',
  },
};

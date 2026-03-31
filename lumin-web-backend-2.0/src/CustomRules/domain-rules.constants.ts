export const ORG_ACCESS_SCOPE = {
  INTERNAL_ONLY: 'internalOnly',
  ALL: 'all',
} as const;

export const MEMBERSHIP_SCOPE = {
  INTERNAL_ONLY: 'internalOnly',
  ALL: 'all',
} as const;

export const FILE_SERVICE = {
  ONLY_DRIVE: 'onlyDrive',
  ALL: 'all',
} as const;

export const FILE_SCOPE = {
  PERSONAL_ONLY: 'personalOnly',
  ALL: 'all',
} as const;

export const INVITE_SCOPE = {
  INTERNAL_ONLY: 'internalOnly',
  ALL: 'all',
} as const;

export const SEARCH_SCOPE = {
  INTERNAL_ONLY: 'internalOnly',
  ALL: 'all',
} as const;

export const POLICY_NAMES = {
  DRIVE_ONLY: 'driveOnly',
} as const;

export const UPLOADABLE_SERVICES = {
  GOOGLE_DRIVE: 'googleDrive',
  ONE_DRIVE: 'oneDrive',
  DROPBOX: 'dropbox',
  LUMIN: 'lumin',
  ALL: 'all',
} as const;

export const ALL_UPLOADABLE_SERVICES = [
  UPLOADABLE_SERVICES.GOOGLE_DRIVE,
  UPLOADABLE_SERVICES.ONE_DRIVE,
  UPLOADABLE_SERVICES.DROPBOX,
  UPLOADABLE_SERVICES.LUMIN,
] as const;

export enum TeamProviderEnums {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  EDITOR = 'editor',
  MEMBER = 'member',
}

export type TeamProviderType = keyof typeof TeamProviderEnums;

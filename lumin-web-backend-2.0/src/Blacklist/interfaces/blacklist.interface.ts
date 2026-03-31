type IRejectedMetadata = {
  rejectedUserId: string,
}

export type IMetadata = IRejectedMetadata;

export interface IBlacklistModel {
  actionType: number,
  value: string,
  createdAt: Date,
  metadata: IMetadata,
}

export interface IBlacklist extends IBlacklistModel {
  _id: string;
}

export interface UserContactItem {
  userId: string,
  recentActivity: Date,
}

export interface UserContactModel {
  userId: any;
  contacts: UserContactItem[],
}

export interface UserContact extends UserContactModel {
  _id: string;
}

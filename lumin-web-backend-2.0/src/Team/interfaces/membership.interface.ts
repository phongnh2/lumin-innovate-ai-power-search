export interface IMembershipModel {
  userId: string;
  teamId: any;
  role: string;
}

export interface IMembership extends IMembershipModel {
  _id: string;
}

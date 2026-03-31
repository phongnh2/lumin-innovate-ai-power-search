export interface IRequestAccessModel {
  actor: string,
  entity: {
    role: string,
    invitee?: string,
  };
  target: string;
  inviterId: string;
  createdAt: Date;
  type: string;
}

export interface IRequestAccess extends IRequestAccessModel {
  _id: string;
}

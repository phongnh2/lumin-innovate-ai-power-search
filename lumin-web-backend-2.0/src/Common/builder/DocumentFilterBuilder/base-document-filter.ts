/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Types } from 'mongoose';

import { IOrganization } from 'Organization/interfaces/organization.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { User } from 'User/interfaces/user.interface';

export type AsyncQueueFunc = () => void | Promise<void>

class BaseDocumentFilter {
  protected _user: User;

  protected _resource: IOrganization | ITeam;

  protected _asyncQueue: AsyncQueueFunc[] = [];

  protected _userId: Types.ObjectId;

  protected _resourceId: Types.ObjectId;

  of(user: User): this {
    this._user = user;
    this._userId = new Types.ObjectId(user._id);
    return this;
  }

  in(resource: IOrganization | ITeam): this {
    this._resource = resource;
    this._resourceId = new Types.ObjectId(resource._id);
    return this;
  }

  protected pushToAsyncQueue(fn: AsyncQueueFunc): void {
    this._asyncQueue.push(fn);
  }
}

export { BaseDocumentFilter };

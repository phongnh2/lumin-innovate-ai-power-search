import { Modify, NotiInterface } from 'Common/factory/NotiFactory/noti.interface';
import { User } from 'User/interfaces/user.interface';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { IFolder } from 'Folder/interfaces/folder.interface';

type FolderActor = {
    user: Partial<User>
}

type FolderTarget = {
  user?: Partial<User>
  targetData?: Record<string, unknown>
  organization?: Partial<IOrganization>
  team?: Partial<ITeam>
}

type FolderEntity = {
  folder?: Partial<IFolder>
}

export type NotiFolderInterface = Modify<NotiInterface, {
  actor: FolderActor,
  target: FolderTarget,
  entity: FolderEntity,
}>;

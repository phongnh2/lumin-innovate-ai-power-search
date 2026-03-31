import { Modify, NotiInterface } from 'Common/factory/NotiFactory/noti.interface';

import { IDocument } from 'Document/interfaces/document.interface';
import { IFolder } from 'Folder/interfaces/folder.interface';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { ITemplate } from 'Template/interfaces/template.interface';
import { User } from 'User/interfaces/user.interface';

type OrganizationActor = {
    user: Partial<User>
    actorData?: Record<string, unknown>
}

export type OrganizationTarget = {
    organization?: Partial<IOrganization>
    user?: Partial<User>
    team?: Partial<ITeam>
    targetData?: Record<string, unknown>
}

type OrganizationEntity = {
    organization?: Partial<IOrganization>
    document?: Partial<IDocument>
    template?: Partial<ITemplate>
    user?: Omit<Partial<User>, keyof { _id: string }> & { _id: string }
    team?: Partial<ITeam>
    totalDocument?: number
    removedDomain?: string
    folder?: Partial<IFolder>
    totalFolder?: number
}

export type NotiOrganizationInterface = Modify<NotiInterface, {
    actor: OrganizationActor,
    target: OrganizationTarget,
    entity: OrganizationEntity,
}>;

import { Modify, NotiInterface } from 'Common/factory/NotiFactory/noti.interface';
import { User } from 'User/interfaces/user.interface';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { IDocument } from 'Document/interfaces/document.interface';
import { ITeam } from 'Team/interfaces/team.interface';

type DocumentActor = {
    user: Partial<User>
}

type DocumentTarget = {
    user?: Partial<User>
    targetData?: Record<string, unknown>
    organization?: Partial<IOrganization>
    team?: Partial<ITeam>
}

type DocumentEntity = {
    document?: Partial<IDocument>
    entityData?: Record<string, unknown>
}

export type NotiDocumentInterface = Modify<NotiInterface, {
    actor: DocumentActor,
    target: DocumentTarget,
    entity: DocumentEntity,
}>;

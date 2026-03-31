import { Modify, NotiInterface } from 'Common/factory/NotiFactory/noti.interface';
import { User } from 'User/interfaces/user.interface';
import { IDocument } from 'Document/interfaces/document.interface';
import { ITemplate } from 'Template/interfaces/template.interface';
import { ITeam } from 'Team/interfaces/team.interface';

type TeamActor = {
    user: Partial<User>
}

type TeamTarget = {
    user?: Partial<User>
    team?: Partial<ITeam>
    targetData?: Record<string, unknown>
}

type TeamEntity = {
    document?: Partial<IDocument>
    template?: Partial<ITemplate>
    totalDocument?: number
}

export type NotiTeamInterface = Modify<NotiInterface, {
    actor: TeamActor,
    target: TeamTarget,
    entity: TeamEntity,
}>;

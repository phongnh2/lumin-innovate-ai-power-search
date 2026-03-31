import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const AcceptanceTeamConditions = (...conditions: string[]): CustomDecorator<string> => SetMetadata('conditions', conditions);

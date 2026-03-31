/* eslint-disable indent */
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { OrganizationRoleInvite } from 'graphql.schema';

export class BulkInviteMembersFromCsvInput {
  @IsNotEmpty()
  @IsString()
  inviterId: string;

  @IsNotEmpty()
  @IsString()
  orgId: string;

  @IsNotEmpty()
  @IsString()
  csvPath: string;

  @IsOptional()
  @IsEnum(OrganizationRoleInvite)
  role?: OrganizationRoleInvite;
}

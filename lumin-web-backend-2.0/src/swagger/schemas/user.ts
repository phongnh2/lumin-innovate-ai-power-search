/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';

export class UserLocationResponse {
  @ApiProperty({
    description: 'City name from Cloudflare headers',
    type: 'string',
  })
    city: string;

  @ApiProperty({
    description: 'Region/State name from Cloudflare headers',
    type: 'string',
  })
    regionName: string;

  @ApiProperty({
    description: 'Two-letter country code from Cloudflare headers',
    type: 'string',
  })
    countryCode: string;
}

export class OrganizationPayment {
  @ApiProperty({
    description: 'Plan of the organization',
    type: 'string',
  })
    plan: string;

  @ApiProperty({
    description: 'Whether the organization has upgraded to a premium plan',
    type: 'boolean',
  })
    hasUpgradedToPremium: boolean;
}

export class LastAccessedOrganization {
  @ApiProperty({
    description: 'Organization ID',
    type: 'string',
  })
    _id: string;

  @ApiProperty({
    description: 'Role of the user in the organization',
    type: 'string',
  })
    role: string;

  @ApiProperty({
    description: 'Payment information of the organization',
    type: () => OrganizationPayment,
  })
    payment: OrganizationPayment;
}

export class WorkspaceConfigurationResponse {
  @ApiProperty({
    description: 'Whether the user is a premium user',
    type: 'boolean',
  })
    isPremiumUser: boolean;

  @ApiProperty({
    description: 'Last accessed organization',
    type: () => LastAccessedOrganization,
    required: false,
    nullable: true,
  })
    lastAccessOrganization?: LastAccessedOrganization;
}

export class UploadMobileFeedbackFilesResponse {
    @ApiProperty({
      description: 'S3 keys of the uploaded files',
      type: [String],
      isArray: true,
    })
      files: string[];
}

export class AcceptNewTermsOfUseResponse {
  @ApiProperty({
    description: 'Version of the terms of use',
    type: 'string',
  })
    termsOfUseVersion: string;
}

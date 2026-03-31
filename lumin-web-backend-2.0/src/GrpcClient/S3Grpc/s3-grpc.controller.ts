import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { OrgTeamDocumentRoles, OrganizationDocumentRoles } from 'Document/enums/organization.roles.enum';
import { DocumentGuestLevelGuardRpc } from 'Document/guards/Grpc/document.guest.permission.guard';

import { S3GrpcService } from './s3-grpc.service';

@Controller('/s3')
export class S3GrpcController {
  constructor(private readonly s3GrpcService: S3GrpcService) {}

  @DocumentGuestLevelGuardRpc(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @GrpcMethod('s3Service', 'GenerateGetObjectUrl')
  generateGetObjectUrl(data: { key: string, bucketName: string, versionId?: string }) {
    return this.s3GrpcService.generateGetObjectUrl(data);
  }

  @DocumentGuestLevelGuardRpc(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @GrpcMethod('s3Service', 'GeneratePutObjectUrl')
  generatePutObjectUrl(data: { key: string, bucketName: string }) {
    return this.s3GrpcService.generatePutObjectUrl(data);
  }

  @DocumentGuestLevelGuardRpc(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @GrpcMethod('s3Service', 'GetObjectMetadata')
  getObjectMetadata(data: { key: string, bucketName: string, versionId?: string }) {
    return this.s3GrpcService.getObjectMetadata(data);
  }
}

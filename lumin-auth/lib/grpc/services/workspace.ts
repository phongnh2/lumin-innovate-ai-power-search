/* eslint-disable max-classes-per-file */
import * as grpc from '@grpc/grpc-js';

import { promisify } from 'util';

import { environment } from '@/configs/environment';
import { loader } from '@/lib/grpc/grpcPkgLoader';
import { ProtoGrpcType } from '@/proto/organization/organization';
import { GetDestinationWorkspaceToUploadRequest } from '@/proto/organization/organization/GetDestinationWorkspaceToUploadRequest';
import { GetDestinationWorkspaceToUploadResponse } from '@/proto/organization/organization/GetDestinationWorkspaceToUploadResponse';
import { GetOrganizationByIdAndUserIdRequest } from '@/proto/organization/organization/GetOrganizationByIdAndUserIdRequest';
import { GetOrganizationByIdAndUserIdResponse } from '@/proto/organization/organization/GetOrganizationByIdAndUserIdResponse';
import { GetOrganizationsByUserIdRequest } from '@/proto/organization/organization/GetOrganizationsByUserIdRequest';
import { GetOrganizationsByUserIdResponse } from '@/proto/organization/organization/GetOrganizationsByUserIdResponse';

const { organization } = loader.load<ProtoGrpcType>('organization/organization.proto', { withProtoDir: true });
const { OrganizationService: WorkspaceServiceBase } = organization;

class WorkspaceServiceDeliver extends WorkspaceServiceBase {}

export class WorkspaceService {
  private service: WorkspaceServiceDeliver;

  constructor() {
    this.service = new WorkspaceServiceDeliver(environment.internal.host.grpcServerUrl, grpc.credentials.createInsecure());
  }

  async getWorkspaceByIdAndUserId(data: GetOrganizationByIdAndUserIdRequest): Promise<GetOrganizationByIdAndUserIdResponse | undefined> {
    const handler = promisify(this.service.GetOrganizationByIdAndUserId).bind(this.service);
    return handler(data);
  }

  async getWorkspacesByUserId(data: GetOrganizationsByUserIdRequest): Promise<GetOrganizationsByUserIdResponse | undefined> {
    const handler = promisify(this.service.GetOrganizationsByUserId).bind(this.service);
    return handler(data);
  }

  async getDestinationWorkspaceToUpload(data: GetDestinationWorkspaceToUploadRequest): Promise<GetDestinationWorkspaceToUploadResponse | undefined> {
    const handler = promisify(this.service.GetDestinationWorkspaceToUpload).bind(this.service);
    return handler(data);
  }
}

export const workspaceService = new WorkspaceService();

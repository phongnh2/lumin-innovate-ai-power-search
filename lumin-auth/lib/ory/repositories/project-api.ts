import { ListOrganizationsResponse, ProjectApi, ProjectApiListOrganizationsRequest, Project } from '@ory/client';

import { environment } from '@/configs/environment';
import { OryAxiosRequestConfig } from '@/interfaces/ory';
import { ExceptionHandler } from '@/lib/decorators/exception.decorator';
import { oryExceptionHandler } from '@/lib/exceptions/ory.exception';

import { OryNetworkRepository } from './ory-network-repository';

@ExceptionHandler(oryExceptionHandler)
class ProjectApiRepository extends OryNetworkRepository<ProjectApi> {
  async listOrganizations(payload: Omit<ProjectApiListOrganizationsRequest, 'projectId'>, options?: OryAxiosRequestConfig): Promise<ListOrganizationsResponse> {
    const { data } = await this._repository.listOrganizations(
      {
        projectId: environment.internal.ory.projectId,
        ...payload
      },
      options
    );
    return data;
  }

  async getProject(options?: OryAxiosRequestConfig): Promise<Project> {
    const { data } = await this._repository.getProject({ projectId: environment.internal.ory.projectId }, options);
    return data;
  }
}

export const projectApi = new ProjectApiRepository(ProjectApi);

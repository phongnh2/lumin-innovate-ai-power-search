/* eslint-disable import/extensions */
import { RequestAccessBuilder } from 'Common/builder/RequestAccessBuilder/request.access.builder';

import { AccessTypeOrganization } from 'Organization/organization.enum';

import { RequestOrganizationEntity, RequestOrganizationInterface } from './request.organization.interface';

export class RequestOrganizationConcreteBuilder implements RequestAccessBuilder<RequestOrganizationInterface, RequestOrganizationEntity> {
  private email: string;

  private orgId: string;

  private entity: RequestOrganizationEntity;

  private type: string;

  setActor(email: string): RequestOrganizationConcreteBuilder {
    this.email = email;
    return this;
  }

  setEntity(entity: RequestOrganizationEntity): RequestOrganizationConcreteBuilder {
    this.entity = entity;
    return this;
  }

  setTarget(orgId: string): RequestOrganizationConcreteBuilder {
    this.orgId = orgId;
    return this;
  }

  setType(type: string = AccessTypeOrganization.REQUEST_ORGANIZATION): RequestOrganizationConcreteBuilder {
    this.type = type;
    return this;
  }

  build(): Record<string, unknown> {
    return new RequestOrganizationInterface(this.email, this.orgId, this.entity, this.type).export();
  }
}

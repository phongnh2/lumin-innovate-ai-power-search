export type RequestOrganizationEntity = {
    role: string;
}

export class RequestOrganizationInterface {
  constructor(
    private email: string,
    private orgId: string,
    private entityData: RequestOrganizationEntity,
    private type: string,
  ) {}

  public export(): Record<string, unknown> {
    return {
      actor: this.email,
      target: this.orgId,
      entity: this.entityData,
      type: this.type,
    };
  }

  get actor(): string {
    return this.email;
  }

  get target(): string {
    return this.orgId;
  }

  get entity(): RequestOrganizationEntity {
    return this.entityData;
  }
}

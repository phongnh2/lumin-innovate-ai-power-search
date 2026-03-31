import { DocumentActionPermissionResource, PolicyPrinciple } from '../../enums/action.permission.enum';
import * as policyData from '../policies.json';

interface Policy {
  sid: string;
  resource: DocumentActionPermissionResource;
  description: string;
  principle: Record<PolicyPrinciple, string | string[]>;
}

export class PolicyRetrievalPoint {
  private policies: Record<string, Policy>;

  private currentPolicy: Policy;

  constructor() {
    const { statements } = policyData.policies;
    const policiesMap = Object.keys(statements).map((action) => ({
      [action]: {
        sid: statements[action].sid,
        principle: { ...statements[action].principle },
        resource: statements[action].resource,
      },
    }));

    this.policies = Object.assign({}, ...policiesMap);
  }

  public from(action: string): this {
    this.currentPolicy = this.policies[action];
    return this;
  }

  public getPrinciple(attribute: string): string | string[] {
    if (this.currentPolicy?.principle) {
      return this.currentPolicy.principle[attribute];
    }

    return '';
  }

  public getAllPrincipleKey(): PolicyPrinciple[] {
    if (this.currentPolicy?.principle) {
      return Object.keys(this.currentPolicy.principle) as PolicyPrinciple[];
    }

    return [];
  }

  public getSid(): string {
    return this.currentPolicy?.sid;
  }
}

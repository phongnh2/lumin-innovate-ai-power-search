import * as policyData from 'Organization/Policy/policies.json';

interface Policy {
  sid: string;
  principal: Record<string, string | string[]>;
  resource: string;
}

export class PolicyRetrievalPoint {
  private policies: Record<string, Policy>;

  private currentPolicy: Policy;

  constructor() {
    const { statements } = policyData.policies;
    const policiesMap = Object.keys(statements).map((operation) => ({
      [operation]: {
        sid: statements[operation].sid,
        principal: { ...statements[operation].principal },
        resource: statements[operation].resource,
      },
    }));

    this.policies = Object.assign({}, ...policiesMap);
  }

  public from(policy: string): PolicyRetrievalPoint {
    this.currentPolicy = this.policies[policy];
    return this;
  }

  public getPrincipal(attribute: string): string | string[] {
    if (this.currentPolicy.principal) {
      return this.currentPolicy.principal[attribute];
    }

    return '';
  }

  public getAllPrincipalKey(): string[] {
    if (this.currentPolicy.principal) {
      return Object.keys(this.currentPolicy.principal);
    }

    return [];
  }

  public getSid(): string {
    return this.currentPolicy.sid;
  }
}

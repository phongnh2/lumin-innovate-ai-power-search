import { PolicyEffect } from 'Common/common.enum';

import { PolicyRetrievalPoint } from './PRP';
import { DocumentActionPermissionResource, PolicyPrinciple } from '../../enums/action.permission.enum';
import { IPolicyRequest } from '../../interfaces/document.action.permission.interface';

export class PolicyDecisionPoint {
  private readonly PRP: PolicyRetrievalPoint = new PolicyRetrievalPoint();

  public evaluate({ resource, attribute }: IPolicyRequest): boolean {
    const { action, resourceAccess } = resource;
    const { role: actorRole, permissions } = attribute.actor;

    const sid = this.PRP.from(action).getSid();
    if (!sid) {
      return false;
    }

    const effect = permissions.find((permission) => permission.name === sid)?.effect;
    if (!effect || effect === PolicyEffect.DENY) {
      return false;
    }

    const principleKeys = this.PRP.from(action).getAllPrincipleKey();

    switch (resourceAccess) {
      case DocumentActionPermissionResource.DOCUMENT: {
        return principleKeys.every((key) => {
          if (key === PolicyPrinciple.ROLE) {
            const acceptanceRoles = this.PRP.from(action).getPrinciple(PolicyPrinciple.ROLE);
            return acceptanceRoles.includes(actorRole);
          }

          return false;
        });
      }
      case DocumentActionPermissionResource.DOCUMENT_TEMPLATE:
        return true;
      default:
        return false;
    }
  }
}

import { unionBy } from 'lodash';

import {
  IVerifyData,
  IResourceRequestData,
} from 'Organization/guards/guards.organization.interface';
import { OrganizationAlgorithm } from 'Organization/guards/strategy.organization.algorithm';
import { IOrganizationGroupPermission, Permission } from 'Organization/interfaces/organization.group.permission.interface';
import { Effect } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { PolicyDecisionPoint } from 'Organization/Policy/architecture/PDP';
import { Resource } from 'Organization/Policy/architecture/policy.enum';
import {
  IPolicyRequest,
  IPolicyActor,
  IPolicyTarget,
  IPolicyRequestResource,
} from 'Organization/Policy/architecture/policy.interface';
import * as policies from 'Organization/Policy/roles.json';

function getListPermissions({
  organizationService, source, resource, groups,
}
  : {
    organizationService: OrganizationService,
    source: string,
    resource: string,
    groups: IOrganizationGroupPermission[] }): Permission[] {
  const baseGroup = groups.find((group) => group.name === source);
  const policyData = policies[resource];
  let newPermissions: Permission[] = [];
  if (baseGroup.version !== policyData[source].version) {
    const resolvers = policyData[source].permissions as Record<string, unknown>;
    newPermissions = Object.values(resolvers).map((resolver) => ({
      name: resolver,
      effect: Effect.ALLOW,
    }) as Permission);
    organizationService.updateGroupPermissionById(baseGroup._id, {
      $set: {
        version: policyData[source].version,
        resource,
        permissions: newPermissions,
      },
    });
  }

  const permissions : Permission[] = groups.reduce((accPermissions, group) => [...accPermissions, ...group.permissions], []);
  return unionBy(permissions.reverse(), newPermissions, 'name');
}

function getResourceId(resource: IResourceRequestData): string {
  switch (resource.resourceAccess) {
    case Resource.ORGANIZATION_TEAM:
      return resource.orgTeamId;
    case Resource.ORGANIZATION:
      return resource.orgId;
    default:
      break;
  }

  return '';
}

export class PrivateOrganizationAlgorithm implements OrganizationAlgorithm {
  private readonly PDP: PolicyDecisionPoint = new PolicyDecisionPoint();

  private async interceptPolicyActor(
    { organizationService, organizationTeamService, data: { actor, resource } } : IVerifyData,
  ): Promise<IPolicyActor> {
    const { _id: actorId } = actor;
    const { orgId, orgTeamId, resourceAccess } = resource;

    const membership = await organizationService.getMembershipByOrgAndUser(orgId, actorId, { _id: 1, role: 1, groups: 1 });
    if (!membership) return null;

    const resourceId = getResourceId(resource);
    const groups = await organizationService.getGroupPermissionByCondition(
      { refId: resourceId, _id: { $in: membership.groups.map((groupId) => groupId) } },
      { name: 1, version: 1, permissions: 1 },
    );
    let actorRole = '';
    let permissions: Permission[] = [];

    switch (resourceAccess) {
      case Resource.ORGANIZATION_TEAM: {
        const teamMembership = await organizationTeamService.getOrgTeamMembershipOfUser(actorId, orgTeamId, { role: 1 });
        if (!teamMembership) return null;
        permissions = getListPermissions({
          organizationService,
          source: teamMembership.role,
          resource: Resource.ORGANIZATION_TEAM,
          groups,
        });
        actorRole = teamMembership.role;
      }
        break;
      case Resource.ORGANIZATION:
        permissions = getListPermissions({
          organizationService,
          source: membership.role,
          resource: Resource.ORGANIZATION,
          groups,
        });
        actorRole = membership.role;
        break;
      default:
        break;
    }

    return {
      role: actorRole,
      permissions,
    };
  }

  private interceptPolicyResource(
    { data: { resource } } : IVerifyData,
  ): IPolicyRequestResource {
    return {
      operation: resource.operation,
      resourceAccess: resource.resourceAccess,
      extraInfo: resource.extraInfo,
    };
  }

  private async interceptPolicyTarget(
    { organizationService, data: { target, resource } } : IVerifyData,
  ): Promise<IPolicyTarget> {
    const { orgId } = resource;
    const { _id: targetId, email: targetEmail } = target;

    let targetMembership;

    if (targetId) {
      targetMembership = await organizationService.getMembershipByOrgAndUser(orgId, targetId, { role: 1 });
    } else if (targetEmail) {
      const targetUser = await organizationService.getUserDataByEmail(targetEmail);
      if (targetUser) {
        targetMembership = await organizationService.getMembershipByOrgAndUser(orgId, targetUser._id, { role: 1 });
        // org pending user created user account but not signin yet
        if (!targetMembership) {
          targetMembership = await organizationService.findMemberInRequestAccess(orgId, targetEmail, { entity: 1 });
        }
      } else {
        targetMembership = await organizationService.findMemberInRequestAccess(orgId, targetEmail, { entity: 1 });
      }
    }

    return targetMembership ? {
      role: targetMembership.role || targetMembership.entity?.role,
    } : {};
  }

  async executeAlgorithm(verifyData: IVerifyData): Promise<boolean> {
    const [
      policyActorData,
      policyTargetData,
    ] = await Promise.all([
      this.interceptPolicyActor(verifyData),
      this.interceptPolicyTarget(verifyData),
    ]);
    const policyResourceData = this.interceptPolicyResource(verifyData);
    const policyRequest = {
      resource: policyResourceData,
      attribute: {
        actor: policyActorData,
        target: policyTargetData,
      },
    } as IPolicyRequest;

    return this.PDP.evaluate(policyRequest);
  }
}

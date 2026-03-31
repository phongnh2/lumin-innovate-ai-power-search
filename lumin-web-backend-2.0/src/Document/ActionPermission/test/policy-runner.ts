import { BSON } from 'bson';
import { readFileSync } from 'fs';
import { join } from 'path';

import { Validator } from '../../../Organization/test/validator';
import { DocumentActionPermissionPrinciple, DocumentActionPermissionResource, PolicyPrinciple } from '../enums/action.permission.enum';
import * as policies from '../Policy/policies.json';
import * as roles from '../Policy/roles.json';

const bson = new BSON();
const roleBSONPath = join(process.cwd(), 'src/Document/ActionPermission/Policy/snapshot/roles.bson');
const policyBSONPath = join(process.cwd(), 'src/Document/ActionPermission/Policy/snapshot/policies.bson');
const rolesBSON = readFileSync(roleBSONPath);
const policyBSON = readFileSync(policyBSONPath);

const snapshotRoles = bson.deserialize(rolesBSON) as Record<string, unknown>;
const snapshotPolicy = bson.deserialize(policyBSON) as Record<string, unknown>;

const validator = new Validator<any>();

const policiesData = policies as Record<string, unknown>;
const rolesData = roles as Record<string, unknown>;
const resourceEnum = Object.values(DocumentActionPermissionResource);
const principleEnum = Object.values(DocumentActionPermissionPrinciple);
const policyPrincipleEnum = Object.values(PolicyPrinciple);

class Runner {
  validatePolicyJson(): boolean {
    Validator.write('Validate policy file system!!!');
    validator
      .title('Should exist key policies')
      .expect(policiesData).existKey('policies').build();

    validator
      .title('Should exist key version in policies')
      .expect(policiesData.policies).existKey('version').build();

    validator
      .title('Should exist key statements in policies')
      .expect(policiesData.policies).existKey('statements').build();

    const sids = [];
    Object.entries((policiesData.policies as Record<string, unknown>).statements).forEach(([statement, value]) => {
      const statementValue = value as Record<string, unknown>;
      validator
        .title(`Should exist key sid in ${statement}`)
        .expect(statementValue).existKey('sid').build();
      validator
        .title(`Expect sid value in ${statement} is unique`)
        .expect(sids).notExistValue(statementValue.sid).build();
      sids.push(statementValue.sid);
      validator
        .title(`Should exist key resource in ${statement}`)
        .expect(statementValue).existKey('resource').build();
      validator
        .title(`Should exist key description in ${statement}`)
        .expect(statementValue).existKey('description').build();
      validator
        .title(`Resource value in ${statement} is one of the ${resourceEnum.toString()}`)
        .expect(statementValue.resource).oneOf(resourceEnum).build();
      validator
        .title(`Should exist key principle in ${statement}`)
        .expect(statementValue).existKey('principle').build();
      Object.entries(statementValue.principle).forEach(([principle, principleValue]) => {
        validator
          .title(`${principle} key in principle of ${statement} is one of the ${policyPrincipleEnum.toString()}`)
          .expect(principle).oneOf(policyPrincipleEnum).build();
        switch (principle as PolicyPrinciple) {
          case PolicyPrinciple.ROLE:
            validator
              .title(`Role value in principle of ${statement} is child of the ${principleEnum.toString()}`)
              .expect(principleValue).childOf(principleEnum).build();
            break;
          default:
            break;
        }
      });
    });

    return !validator.isFailed();
  }

  validateRolesJson(): boolean {
    Validator.write('Validate roles file system!!!');
    const permissions = Object.keys((policiesData.policies as Record<string, unknown>).statements);
    Object.keys(rolesData).forEach((resource) => {
      validator
        .title(`Key ${resource} is one of the ${resourceEnum.toString()}`)
        .expect(resource).oneOf(resourceEnum).build();
    });

    Object.values(rolesData).forEach((resourceValue) => {
      Object.entries(resourceValue).forEach(([role, roleValue]) => {
        validator
          .title(`Should exist key version in ${role}`)
          .expect(roleValue).existKey('version').build();
        validator
          .title('Expect version is number')
          .expect((roleValue as Record<string, unknown>).version).isNumber().build();
        validator
          .title(`${role} is valid`)
          .expect(role).oneOf(principleEnum).build();
        Object.keys(roleValue.permissions as Record<string, unknown>).forEach((permission) => {
          validator
            .title(`${permission} is valid`)
            .expect(permission).oneOf(permissions).build();
        });
      });
    });

    return !validator.isFailed();
  }

  validatePolicyWithRolesFileSystem(): void {
    Validator.write('Validate policy file system with roles file system!!!');

    const systemPolicyKeys = Object.keys((policiesData.policies as Record<string, unknown>).statements);
    const systemPolicyValues = {};
    Object.entries((policiesData.policies as Record<string, unknown>).statements)
      .forEach(([name, id]) => { systemPolicyValues[name] = id.sid; });
    const [allPolicyInRoles, allResoureValueInRoles] = Object.entries(rolesData).reduce(([policy, resouceVal], [_, resourceValue]) => {
      const [curPolicy, curResource] = Object.entries(resourceValue).reduce(([accumPer, accumResouce], [, roleValue]) => {
        const permissions = Object.keys(roleValue.permissions as Record<string, unknown>);
        return [[...accumPer, ...permissions], { ...accumResouce, ...roleValue.permissions }];
      }, [[], {}]);
      return [[...policy, ...curPolicy], { ...resouceVal, ...curResource }];
    }, [[], {}]);
    const uniquePolicyInRoles = Array.from(new Set(allPolicyInRoles));
    systemPolicyKeys.forEach((policy) => {
      validator
        .title(`Expect ${policy} is used at least once in roles file system`)
        .expect(uniquePolicyInRoles).existValue(policy)
        .build();
    });
    allPolicyInRoles.forEach((policy) => {
      validator
        .title(`Expect sid of ${policy} in role is matching with policy file system`)
        .expect(allResoureValueInRoles[policy]).isEqual(systemPolicyValues[policy])
        .build();
    });
  }

  validateSidOfPolicy(): boolean {
    Validator.write('Validate sid policy file system!!!');
    const { statements } = (policiesData.policies as Record<string, unknown>);
    const { statements: snapshotStatement } = (snapshotPolicy.policies as Record<string, unknown>);
    Object.entries(snapshotStatement).forEach(([key, { sid }]) => {
      const rawValue = statements[key] as Record<string, unknown>;
      if (rawValue) {
        validator
          .title(`Expect sid of ${key} not changed`)
          .expect(sid).isEqual(rawValue.sid)
          .build();
      }
    });

    return !validator.isFailed();
  }

  validateSidOfRoles(): boolean {
    Validator.write('Validate sid roles file system!!!');
    Object.entries(snapshotRoles).forEach(([resource, snapRoles]) => {
      const rawRoles = roles[resource];
      Object.entries(snapRoles).forEach(([role, snapRoleValue]) => {
        const rawRole = rawRoles[role];
        Object.entries(snapRoleValue.permissions as Record<string, unknown>).forEach(([name, value]) => {
          const rawValue = rawRole.permissions[name];
          if (rawValue) {
            validator
              // eslint-disable-next-line @typescript-eslint/no-base-to-string
              .title(`Expect sid ${value} not changed`)
              .expect(value).isEqual(rawValue)
              .build();
          }
        });
      });
    });
    return !validator.isFailed();
  }

  comparePoliciesFileSystemWithSnapshot(): void {
    Validator.write('Validate policy file system with policy snapshot!!!');
    validator
      .title('Expect policy file system equal to policy snapshot')
      .error('Policy file system is not matching with snapshot. You should run npm run gen-policy to generate the new snapshot')
      .expect(policies).isEqual(snapshotPolicy)
      .build();
  }

  compareRolesFileSystemWithSnapshot(): void {
    Validator.write('Validate roles file system with roles snapshot!!!');
    validator
      .title('Expect roles file system equal to roles snapshot')
      .error('Roles file system is not matching with snapshot. You should run npm run gen-roles:document to generate the new snapshot')
      .expect(roles).isEqual(snapshotRoles)
      .build();
  }

  summary(): void {
    validator.summary();
  }
}

export default new Runner();

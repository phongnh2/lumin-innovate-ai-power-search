import { getDirective, mapSchema, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema, GraphQLFieldConfig } from 'graphql';

import { DataLoaderRegistry } from 'DataLoader/dataLoader.registry';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationRoleEnums } from 'Organization/organization.enum';
import { PaymentPlanEnums } from 'Payment/payment.enum';

const defaultPrivilegedRoles = [
  OrganizationRoleEnums.MEMBER,
  OrganizationRoleEnums.BILLING_MODERATOR,
  OrganizationRoleEnums.ORGANIZATION_ADMIN,
];
const operationsToApplyMasking = ['orgsOfUser', 'getOrganizationByUrl'];

const shouldMaskField = ({
  role,
  privilegedRoles,
}: {
  role?: OrganizationRoleEnums | string;
  privilegedRoles?: string[];
}): boolean => {
  if (!role) {
    return false;
  }
  const privilegedRolesSet = privilegedRoles
    ? new Set(privilegedRoles.map((r) => r.toLowerCase()))
    : new Set<string>(defaultPrivilegedRoles);
  const isPrivilegedUser = privilegedRolesSet.has(role.toString().toLowerCase());
  return !isPrivilegedUser;
};

const getUserRoleFromContext = async (
  context: any,
  organizationId: string,
): Promise<string | undefined> => {
  const { user } = context.req || {};
  const { loaders } = context as { loaders?: DataLoaderRegistry };

  if (!user || !loaders || !organizationId) {
    return undefined;
  }

  try {
    const membership = await loaders.orgMembershipLoader.load(
      `${user._id}-${organizationId}`,
    );
    return membership?.role;
  } catch (error) {
    return undefined;
  }
};

export const createMaskPaymentFieldDirectiveTransformer = () => (schema: GraphQLSchema) => mapSchema(schema, {
  [MapperKind.OBJECT_FIELD]: (
    fieldConfig: GraphQLFieldConfig<any, any>,
  ) => {
    const directiveResult = getDirective(
      schema,
      fieldConfig,
      'RequireRole',
    )?.[0] as
          | {
              roles?: string[];
            }
          | undefined;

    if (!directiveResult) {
      return fieldConfig;
    }

    const originalResolve = fieldConfig.resolve;

    return {
      ...fieldConfig,
      resolve: async (source, args, context, info) => {
        const result = originalResolve
          ? await originalResolve(source, args, context, info)
          : source[info.fieldName];

        if (!result || !operationsToApplyMasking.includes(info.operation.name?.value)) {
          return result;
        }

        if (info.fieldName === 'payment' && info.parentType.name === 'Organization') {
          context.__rootTarget = source;
          return result;
        }

        const organization = context.__rootTarget as IOrganization;
        if (!organization) {
          return result;
        }
        const isFreeOrg = organization.payment?.type === PaymentPlanEnums.FREE
          && organization.payment?.subscriptionItems?.every(
            (subItem) => subItem.paymentType === PaymentPlanEnums.FREE,
          );

        if (isFreeOrg) {
          return result;
        }

        const organizationId = organization._id;
        const userRole = await getUserRoleFromContext(
          context,
          organizationId,
        );

        if (shouldMaskField({ role: userRole, privilegedRoles: directiveResult.roles })) {
          return null;
        }
        return result;
      },
    };
  },
});

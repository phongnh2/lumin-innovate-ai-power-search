import { ExecutionContext, createParamDecorator } from '@nestjs/common';

/**
 * Use this instead of request.organization
 * since request with multiple queries will be execute in parallel
 * result in overriding the organization
 */
export const CurrentOrganization = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    // Attached in organization.permission.guard.ts
    const { metadata } = ctx.getArgs().find((arg) => arg?.metadata) || {};
    return metadata.organization;
  },
);

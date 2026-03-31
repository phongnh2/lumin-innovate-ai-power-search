export enum Principal {
    ROLE = 'role',
    PREMIUM_REQUIRED = 'premium_required',
    PREMIUM_PRODUCTS_REQUIRED = 'premium_products_required',
    HIGHER_ROLE_REQUIRED = 'higher_role_required',
    HIGHER_OR_EQUAL_ROLE_REQUIRED = 'higher_or_equal_role_required',
    TEAM_ADMIN_REQUIRED = 'admin_required',
    INTERNAL_REQUIRED = 'internal_required',
    PLAN = 'plan',
    ASSOCIATED_DOMAIN_REQUIRED = 'associated_domain_required',
    ORGANIZATION_FREE_REQUIRED_WITH_ROLE = 'organization_free_required_with_role',
    OLD_PLAN_UNSUPPORTED = 'old_plan_unsupported',
}

export enum Resource {
    ORGANIZATION = 'organization',
    ORGANIZATION_TEAM = 'organization_team',
}

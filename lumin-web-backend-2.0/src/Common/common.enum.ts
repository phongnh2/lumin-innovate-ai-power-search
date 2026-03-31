export enum SortStrategy {
  ASC = 1,
  DESC = -1,
}

export enum ActionTypeEnum {
  ADMIN_DELETE_USER = 'admin_delete_user',
  ADMIN_DELETE_ORG = 'admin_delete_org',
  DELETE_DEFAULT_ORG = 'delete_default_org',
  DEACTIVE_USER_ACCOUNT = 'deactive_user_account',
}

export enum EmailTagEnum {
  AUTHENTICATION_EMAILS = 'Authentication emails',
  DOCUMENT_EMAILS = 'Document emails',
  SHARE_EMAILS = 'Share emails',
  ORGANIZATION_EMAILS = 'Organization emails',
  TEAM_EMAILS = 'Team emails',
  // new tags
  WELCOME = 'Welcome',
  AUTHEN_ACCOUNT_DELETED = 'Authen - Account deleted',
  DOCUMENT_MENTIONED = 'Document - Mentioned',
  DOCUMENT_COMMENTED = 'Document - Commented',
  DOCUMENT_COMMENTS_REPLIED = 'Document - Comments replied',
  DOCUMENT_SHARED = 'Document - Shared',
  DOCUMENT_SHARED_WITH_NON_LUMIN_USERS = 'Document - Shared with non-Lumin users',
  DOCUMENT_PERMISSION_REQUESTS = 'Document - Permission requests',
  DOCUMENT_PERMISSION_ACCEPTANCES = 'Document - Permission acceptances',
  CIRCLE_CREATED = 'Circle - Created',
  CIRCLE_INVITES = 'Circle - Invites',
  CIRCLE_INVITES_FROM_SAME_BUSINESS_DOMAIN = 'Circle - Invites from same business domain',
  CIRCLE_OWNERSHIP_TRANSFERRED_AUTOMATICALLY = 'Circle - Ownership transferred automatically',
  CIRCLE_OWNERSHIP_REQUESTS = 'Circle - Ownership requests',
  CIRCLE_OWNERSHIP_ACCEPTANCES = 'Circle - Ownership acceptances',
  CIRCLE_REMOVED = 'Circle - Removed',
  CIRCLE_ACCESS_ACCEPTANCES = 'Circle - Access acceptances',
  CIRCLE_REQUEST_TO_JOIN_ENABLED_AUTOMATICALLY = 'Circle - Request to join enabled automatically',
  TEAM_INVITES = 'Team - Invites',
  TEAM_OWNERSHIP_TRANSFERRED = 'Team - Ownership transferred',
  PAYMENT_TRIAL_STARTED = 'Payment - Trial started',
  PAYMENT_TRIAL_CANCELED = 'Payment - Trial canceled',
  PAYMENT_OLD_ENTERPRISE = 'Payment - Old Enterprise',
  PAYMENT_UPGRADED_TO_OLD_ENTERPRISE = 'Payment - Upgraded to Old Enterprise',
  PAYMENT_CIRCLE_SUBSCRIPTION_CHANGED = 'Payment - Circle subscription changed',
  PAYMENT_RENEWED_FAILED = 'Payment - Renewed failed',
  PAYMENT_SET_TO_CANCEL = 'Payment - Set to cancel',
  PAYMENT_CANCELED = 'Payment - Canceled',
  PAYMENT_UPGRADED_MULTI_PRODUCTS = 'Payment - Upgrade to multiple products at once',
  PAYMENT_UPGRADED_FROM_MONTHLY_TO_ANNUAL = 'Payment - Upgrade from Monthly to Annual',
  ADMIN_DASHBOARD_INVITES = 'Admin Dashboard - Invites',
  ADMIN_DASHBOARD_SUBSCRIPTION_CHANGED_SUCCESSFULLY = 'Admin Dashboard - Subscription changed successfully',
  ADMIN_DASHBOARD_SUBSCRIPTION_CHANGED_FAILED = 'Admin Dashboard - Subscription changed failed',
  CIRCLE_GRANTED_ADMINS_AUTOMATICALLY = 'Circle - Granted Admins automatically',
  CIRCLE_MEMBERS_INVITE_OTHERS = 'Circle - Members invite others',
  CIRCLE_ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY = 'Circle - Anyone can join enabled  automatically',
  CIRCLE_JOINED_VIA_INVITE_LINK = 'Circle - Joined via invite link',
  // dynamic tags
  PAYMENT_STARTER = 'Payment - Starter',
  PAYMENT_PRO = 'Payment - Pro',
  PAYMENT_BUSINESS = 'Payment - Business',
  PAYMENT_MONTHLY_SUBSCRIPTION_RENEWED = 'Payment - Monthly subscription renewed',
  PAYMENT_ANNUAL_SUBSCRIPTION_RENEWED = 'Payment - Annual subscription renewed',
  PAYMENT_SET_TO_CANCEL_IN_3_DAYS = 'Payment - Set to cancel in 3 days',
  PAYMENT_SET_TO_CANCEL_IN_1_DAY = 'Payment - Set to cancel in 1 day',
  SIGN_SUBSCRIPTION_UPGRADED_TO_PRO = 'Sign - Subscription - Upgrade to Pro',
  SIGN_SUBSCRIPTION_PURCHASE_MORE_SEATS = 'Sign - Subscription - Purchase more seats',
  ASSIGN_SIGN_SEATS = 'Sign - Subscription - Assign seats',
  UNASSIGN_SIGN_SEATS = 'Sign - Subscription - Unassign seats',
  REQUEST_SIGN_SEAT = 'Sign - Subscription - Request seat',
  REJECT_SIGN_SEAT_REQUEST = 'Sign - Subscription - Reject sign seat request',
}

export type RecursivePartial<K> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [attr in keyof K]?: K[attr] extends object ? RecursivePartial<K[attr]> : K[attr];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export enum PolicyEffect {
  ALLOW = 'allow',
  DENY = 'deny',
}

import { EmailTagEnum } from 'Common/common.enum';
import { ORG_URL_SEGEMENT, ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';
import { FREE_TRIAL_DAYS } from 'Common/constants/PaymentConstant';
import { TEAM_TEXT, TEAM_URL_SEGEMENT } from 'Common/constants/TeamConstant';

export const EMAIL_TYPE = {
  WELCOME: {
    category: 'commonEmail',
    description: 'WELCOME',
    tag: EmailTagEnum.WELCOME,
  },
  CONFIRM_EMAIL: {
    category: 'commonEmail',
    description: 'CONFIRM_EMAIL',
  },
  RESET_PASSWORD: {
    category: 'commonEmail',
    description: 'RESET_PASSWORD',
  },
  SHARE_DOCUMENT: {
    category: 'shareDocument',
    description: 'SHARE_DOCUMENT',
    tag: EmailTagEnum.DOCUMENT_SHARED,
  },
  SHARE_DOCUMENT_NON_LUMIN: {
    category: 'commonEmail',
    description: 'SHARE_DOCUMENT_NON_LUMIN',
    tag: EmailTagEnum.DOCUMENT_SHARED_WITH_NON_LUMIN_USERS,
  },
  REQUEST_ACCESS: {
    category: 'requestAccessDocument',
    description: 'REQUEST_ACCESS',
    tag: EmailTagEnum.DOCUMENT_PERMISSION_REQUESTS,
  },
  UPGRADE_ANNUAL_PLAN: {
    category: 'subscriptionEmail',
    description: 'UPGRADE_ANNUAL_PLAN',
  },
  CANCEL_PLAN: {
    category: 'subscriptionEmail',
    description: 'CANCEL_PLAN',
  },
  RENEW_PLAN_SUCCESS: {
    category: 'subscriptionEmail',
    description: 'RENEW_PLAN_SUCCESS',
  },
  RENEW_PLAN_FAILED: {
    category: 'subscriptionEmail',
    description: 'RENEW_PLAN_FAILED',
  },
  MENTION_EMAIL: {
    category: 'mentionCommentDocument',
    description: 'MENTION_EMAIL',
    tag: EmailTagEnum.DOCUMENT_MENTIONED,
  },
  COMMENT_EMAIL: {
    category: 'commentDocument',
    description: 'COMMENT_EMAIL',
    tag: EmailTagEnum.DOCUMENT_COMMENTED,
  },
  REPLY_COMMENT: {
    category: 'replyCommentDocument',
    description: 'REPLY_COMMENT',
    tag: EmailTagEnum.DOCUMENT_COMMENTS_REPLIED,
  },
  CONFIRM_CANCEL_PLAN: {
    category: 'subscriptionEmail',
    description: 'CONFIRM_CANCEL_PLAN',
  },
  SUBSCRIBE_FREE_TRIAL: {
    category: 'subscriptionEmail',
    description: 'SUBSCRIBE_FREE_TRIAL',
    tag: EmailTagEnum.PAYMENT_TRIAL_STARTED,
  },
  CANCEL_FREE_TRIAL: {
    category: 'subscriptionEmail',
    description: 'CANCEL_FREE_TRIAL',
    tag: EmailTagEnum.PAYMENT_TRIAL_CANCELED,
  },
  INVITE_MEMBER_TO_ORGANIZATION: {
    category: 'inviteToOrganization',
    description: 'INVITE_MEMBER_TO_ORGANIZATION',
    tag: EmailTagEnum.CIRCLE_INVITES,
  },
  ACCEPT_REQUEST_ACCESS_DOCUMENT: {
    category: 'commonEmail',
    description: 'ACCEPT_REQUEST_ACCESS_DOCUMENT',
    tag: EmailTagEnum.DOCUMENT_PERMISSION_ACCEPTANCES,
  },
  GRANT_ORG_ADMIN_CONFIRMATION: {
    category: 'commonEmail',
    description: 'GRANT_ORG_ADMIN_CONFIRMATION',
    tag: EmailTagEnum.CIRCLE_OWNERSHIP_REQUESTS,
  },
  ACCEPTED_ORG_OWNER_TRANSFER: {
    category: 'commonEmail',
    description: 'ACCEPTED_ORG_OWNER_TRANSFER',
    tag: EmailTagEnum.CIRCLE_OWNERSHIP_ACCEPTANCES,
  },
  REMOVE_ORG_MEMBER: {
    category: 'commonEmail',
    description: 'REMOVE_ORG_MEMBER',
    tag: EmailTagEnum.CIRCLE_REMOVED,
  },
  ACCEPT_REQUEST_ACCESS_ORGANIZATION: {
    category: 'commonEmail',
    description: 'ACCEPT_REQUEST_ACCESS_ORGANIZATION',
    tag: EmailTagEnum.CIRCLE_ACCESS_ACCEPTANCES,
  },
  ADD_MEMBER_TO_ORGANIZATION_TEAM: {
    category: 'inviteToOrganizationTeam',
    description: 'ADD_MEMBER_TO_ORGANIZATION_TEAM',
    tag: EmailTagEnum.TEAM_INVITES,
  },
  TRANSFER_TEAM_ADMIN: {
    category: 'commonEmail',
    description: 'TRANSFER_TEAM_ADMIN',
    tag: EmailTagEnum.TEAM_OWNERSHIP_TRANSFERRED,
  },
  WELCOME_ORGANIZATION_BUSINESS: {
    category: 'commonEmail',
    description: 'WELCOME_ORGANIZATION_BUSINESS',
  },
  ORGANIZATION_UPGRADE_SUBSCRIPTION: {
    category: 'subscriptionEmail',
    description: 'ORGANIZATION_UPGRADE_SUBSCRIPTION',
    tag: EmailTagEnum.PAYMENT_UPGRADED_TO_OLD_ENTERPRISE,
  },
  RENEW_PLAN_SUCCESS_ORGANIZATION: {
    category: 'subscriptionEmail',
    description: 'RENEW_PLAN_SUCCESS_ORGANIZATION',
  },
  RENEW_PLAN_FAILED_ORGANIZATION: {
    category: 'subscriptionEmail',
    description: 'RENEW_PLAN_FAILED_ORGANIZATION',
    tag: EmailTagEnum.PAYMENT_RENEWED_FAILED,
  },
  CONFIRM_CANCEL_PLAN_ORGANIZATION: {
    category: 'subscriptionEmail',
    description: 'CONFIRM_CANCEL_PLAN_ORGANIZATION',
    tag: EmailTagEnum.PAYMENT_SET_TO_CANCEL,
  },
  CANCEL_PLAN_ORGANIZATION: {
    category: 'subscriptionEmail',
    description: 'CANCEL_PLAN_ORGANIZATION',
    tag: EmailTagEnum.PAYMENT_CANCELED,
  },
  REMIND_SUBSCRIPTION_ORGANIZATION_EXPIRE: {
    category: 'subscriptionEmail',
    description: 'REMIND_SUBSCRIPTION_ORGANIZATION_EXPIRE',
  },
  ORGANIZATION_UPGRADE_MULTI_PRODUCTS: {
    category: 'subscriptionEmail',
    description: 'ORGANIZATION_UPGRADE_MULTI_PRODUCTS',
    tag: EmailTagEnum.PAYMENT_UPGRADED_MULTI_PRODUCTS,
  },
  ORGANIZATION_UPGRADE_MONTHLY_TO_ANNUAL: {
    category: 'subscriptionEmail',
    description: 'ORGANIZATION_UPGRADE_MONTHLY_TO_ANNUAL',
    tag: EmailTagEnum.PAYMENT_UPGRADED_FROM_MONTHLY_TO_ANNUAL,
  },
  CREATE_ORGANIZATION: {
    category: 'commonEmail',
    description: 'CREATE_ORGANIZATION',
    tag: EmailTagEnum.CIRCLE_CREATED,
  },
  DISABLED_AUTO_APPROVE_AUTOMATICALLY: {
    category: 'commonEmail',
    description: 'DISABLED_AUTO_APPROVE_AUTOMATICALLY',
    tag: EmailTagEnum.CIRCLE_REQUEST_TO_JOIN_ENABLED_AUTOMATICALLY,
  },
  SALE_UPGRADE_PAYMENT_LINK_SUCCESSFULLY: {
    category: 'subscriptionEmail',
    description: 'SALE_UPGRADE_PAYMENT_LINK_SUCCESSFULLY',
    tag: EmailTagEnum.ADMIN_DASHBOARD_SUBSCRIPTION_CHANGED_SUCCESSFULLY,
  },
  SALE_UPGRADE_PAYMENT_LINK_EXPIRED: {
    category: 'subscriptionEmail',
    description: 'SALE_UPGRADE_PAYMENT_LINK_EXPIRED',
    tag: EmailTagEnum.ADMIN_DASHBOARD_SUBSCRIPTION_CHANGED_FAILED,
  },
  ORG_ENTERPRISE_STARTED: {
    category: 'subscriptionEmail',
    description: 'ORG_ENTERPRISE_STARTED',
    tag: EmailTagEnum.PAYMENT_OLD_ENTERPRISE,
  },
  ADMIN_RESET_PASSWORD: {
    category: 'commonEmail',
    description: 'ADMIN_RESET_PASSWORD',
  },
  ADMIN_CREATE_PASSWORD: {
    category: 'commonEmail',
    description: 'ADMIN_CREATE_PASSWORD',
    tag: EmailTagEnum.ADMIN_DASHBOARD_INVITES,
  },
  TRANSFER_ORG_ADMIN: {
    category: 'commonEmail',
    description: 'TRANSFER_ORG_ADMIN',
    tag: EmailTagEnum.CIRCLE_OWNERSHIP_TRANSFERRED_AUTOMATICALLY,
  },
  DELETE_USER_ACCOUNT: {
    category: 'commonEmail',
    description: 'DELETE_USER_ACCOUNT',
    tag: EmailTagEnum.AUTHEN_ACCOUNT_DELETED,
  },
  WELCOME_PERSONAL_PROFESSIONAL: {
    category: 'commonEmail',
    description: 'WELCOME_PERSONAL_PROFESSIONAL',
  },
  WELCOME_ORGANIZATION_NEW_PRICING: {
    category: 'commonEmail',
    description: 'WELCOME_ORGANIZATION_NEW_PRICING',
  },
  ORGANIZATION_UPGRADE_NEW_PRICING_SUBSCRIPTION: {
    category: 'commonEmail',
    description: 'ORGANIZATION_UPGRADE_NEW_PRICING_SUBSCRIPTION',
    tag: EmailTagEnum.PAYMENT_CIRCLE_SUBSCRIPTION_CHANGED,
  },
  SUBSCRIPTION_CANCELED_AS_FRAUD_DETECTED: {
    category: 'subscriptionEmail',
    description: 'SUBSCRIPTION_CANCELED_AS_FRAUD_DETECTED',
  },
  INVITE_MEMBER_TO_ORGANIZATION_SAME_UNPOPULAR_DOMAIN: {
    category: 'inviteToOrganization',
    description: 'INVITE_MEMBER_TO_ORGANIZATION_SAME_UNPOPULAR_DOMAIN',
    tag: EmailTagEnum.CIRCLE_INVITES_FROM_SAME_BUSINESS_DOMAIN,
  },
  MEMBER_GRANTED_TO_ADMIN_WHEN_UPGRADE_SUBSCRIPTION: {
    category: 'commonEmail',
    description: 'MEMBER_GRANTED_TO_ADMIN_WHEN_UPGRADE_SUBSCRIPTION',
    tag: EmailTagEnum.CIRCLE_GRANTED_ADMINS_AUTOMATICALLY,
  },
  FIRST_MEMBER_INVITE_COLLABORATOR: {
    category: 'inviteToOrganization',
    description: 'FIRST_MEMBER_INVITE_COLLABORATOR',
    tag: EmailTagEnum.CIRCLE_MEMBERS_INVITE_OTHERS,
  },
  ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY: {
    category: 'commonEmail',
    description: 'ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY',
    tag: EmailTagEnum.CIRCLE_ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY,
  },
  USER_JOINS_ORGANIZATION_VIA_INVITE_LINK: {
    category: 'inviteToOrganization',
    description: 'USER_JOINS_ORGANIZATION_VIA_INVITE_LINK',
    tag: EmailTagEnum.CIRCLE_JOINED_VIA_INVITE_LINK,
  },
  WELCOME_ORGANIZATION_SIGN_PRO: {
    category: 'subscriptionEmail',
    description: 'WELCOME_ORGANIZATION_SIGN_PRO',
    tag: EmailTagEnum.SIGN_SUBSCRIPTION_UPGRADED_TO_PRO,
  },
  SIGN_SUBSCRIPTION_PURCHASE_MORE_SEATS: {
    category: 'subscriptionEmail',
    description: 'SIGN_SUBSCRIPTION_PURCHASE_MORE_SEATS',
    tag: EmailTagEnum.SIGN_SUBSCRIPTION_PURCHASE_MORE_SEATS,
  },
  ASSIGN_SIGN_SEATS: {
    category: 'commonEmail',
    description: 'ASSIGN_SIGN_SEATS',
    tag: EmailTagEnum.ASSIGN_SIGN_SEATS,
  },
  UNASSIGN_SIGN_SEATS: {
    category: 'commonEmail',
    description: 'UNASSIGN_SIGN_SEATS',
    tag: EmailTagEnum.UNASSIGN_SIGN_SEATS,
  },
  REQUEST_SIGN_SEAT: {
    category: 'commonEmail',
    description: 'REQUEST_SIGN_SEAT',
    tag: EmailTagEnum.REQUEST_SIGN_SEAT,
  },
  REJECT_SIGN_SEAT_REQUEST: {
    category: 'commonEmail',
    description: 'REJECT_SIGN_SEAT_REQUEST',
    tag: EmailTagEnum.REJECT_SIGN_SEAT_REQUEST,
  },
};

export const SUBJECT = {
  [EMAIL_TYPE.WELCOME.description]: 'Welcome to Lumin',
  [EMAIL_TYPE.CONFIRM_EMAIL.description]: 'Confirm your email address',
  [EMAIL_TYPE.SHARE_DOCUMENT.description]: '#{userName} shared #{documentName} with you',
  [EMAIL_TYPE.SHARE_DOCUMENT_NON_LUMIN.description]: '#{userName} shared #{documentName} with you',
  [EMAIL_TYPE.CANCEL_PLAN.description]: 'Professional subscription canceled',
  [EMAIL_TYPE.RENEW_PLAN_SUCCESS.description]: 'Your Professional subscription has been renewed',
  [EMAIL_TYPE.RENEW_PLAN_SUCCESS_ORGANIZATION.description]: `Your subscription for #{orgName}'s ${ORGANIZATION_TEXT} has been renewed`,
  [EMAIL_TYPE.RENEW_PLAN_FAILED.description]: 'We’ve had a problem renewing your Lumin subscription',
  [EMAIL_TYPE.RENEW_PLAN_FAILED_ORGANIZATION.description]: `Your subscription for #{orgName}'s ${ORGANIZATION_TEXT} could not be renewed`,
  [EMAIL_TYPE.RESET_PASSWORD.description]: 'Please reset your password',
  [EMAIL_TYPE.MENTION_EMAIL.description]: '#{userName} mentioned you on the document #{documentName} at #{time}.',
  [EMAIL_TYPE.COMMENT_EMAIL.description]: '#{userName} added a comment to your document #{documentName}',
  [EMAIL_TYPE.REPLY_COMMENT.description]: '#{userName} replied to your comment on #{documentName}',
  [EMAIL_TYPE.CONFIRM_CANCEL_PLAN.description]: `Your Lumin subscription for #{teamName} ${TEAM_TEXT} will end on #{dateEnd}`,
  [EMAIL_TYPE.SUBSCRIBE_FREE_TRIAL.description]: `Welcome to ${FREE_TRIAL_DAYS} days of FREE Lumin #{plan}`,
  [EMAIL_TYPE.CANCEL_FREE_TRIAL.description]: 'Your free trial has been canceled',
  [EMAIL_TYPE.REQUEST_ACCESS.description]: 'Request access',
  [EMAIL_TYPE.INVITE_MEMBER_TO_ORGANIZATION.description]: `#{userName} invited you to #{orgName}'s ${ORGANIZATION_TEXT}`,
  [EMAIL_TYPE.ACCEPT_REQUEST_ACCESS_DOCUMENT.description]: '#{docName} - Access granted',
  [EMAIL_TYPE.GRANT_ORG_ADMIN_CONFIRMATION.description]:
    `#{ownerOrgName} wants to transfer the ownership of #{orgName}'s ${ORGANIZATION_TEXT} to you`,
  [EMAIL_TYPE.ACCEPTED_ORG_OWNER_TRANSFER.description]: '#{ownerOrgName} accepted your transfer',
  [EMAIL_TYPE.REMOVE_ORG_MEMBER.description]: `#{userName}, you've been removed from #{orgName}'s ${ORGANIZATION_TEXT}`,
  [EMAIL_TYPE.ACCEPT_REQUEST_ACCESS_ORGANIZATION.description]: '#{orgName} - Access granted',
  [EMAIL_TYPE.ADD_MEMBER_TO_ORGANIZATION_TEAM.description]: `#{actorName} invited you to #{orgTeamName}'s ${TEAM_TEXT}`,
  [EMAIL_TYPE.TRANSFER_TEAM_ADMIN.description]: `#{actorName} transferred the ownership of #{teamName}'s ${TEAM_TEXT} to you`,
  [EMAIL_TYPE.WELCOME_ORGANIZATION_BUSINESS.description]: `#{orgName}'s ${ORGANIZATION_TEXT} has been upgraded to Lumin Business`,
  [EMAIL_TYPE.DISABLED_AUTO_APPROVE_AUTOMATICALLY.description]: `Your ${ORGANIZATION_TEXT} was auto-changed to visible for anyone to request`,
  [EMAIL_TYPE.SALE_UPGRADE_PAYMENT_LINK_SUCCESSFULLY.description]:
    `#{orgName} ${ORGANIZATION_TEXT} has been successfully upgraded to #{plan}`,
  [EMAIL_TYPE.SALE_UPGRADE_PAYMENT_LINK_EXPIRED.description]:
    `#{orgName} ${ORGANIZATION_TEXT} has been failed to upgrade to #{plan} because of the expiration`,
  [EMAIL_TYPE.ORG_ENTERPRISE_STARTED.description]: `#{orgName}'s ${ORGANIZATION_TEXT} has been upgraded to Lumin Enterprise`,
  [EMAIL_TYPE.ORGANIZATION_UPGRADE_SUBSCRIPTION.description]:
    `Your subscription for #{orgName}'s ${ORGANIZATION_TEXT} has been changed`,
  [EMAIL_TYPE.ADMIN_RESET_PASSWORD.description]: 'Lumin Password Reset',
  [EMAIL_TYPE.ADMIN_CREATE_PASSWORD.description]: 'Your account has been created at Lumin',
  [EMAIL_TYPE.TRANSFER_ORG_ADMIN.description]: '#{actorName} transferred the ownership of #{orgName} to you',
  [EMAIL_TYPE.DELETE_USER_ACCOUNT.description]: 'Your account has been deleted',
  [EMAIL_TYPE.UPGRADE_ANNUAL_PLAN.description]: 'Your Personal Monthly subscription has been upgraded to the Professional Annual plan',
  [EMAIL_TYPE.WELCOME_PERSONAL_PROFESSIONAL.description]: 'Welcome to Lumin Professional!',
  [EMAIL_TYPE.REMIND_SUBSCRIPTION_ORGANIZATION_EXPIRE.description]:
    `Your subscription for #{orgName}'s ${ORGANIZATION_TEXT} will expire soon`,
  [EMAIL_TYPE.CONFIRM_CANCEL_PLAN_ORGANIZATION.description]: `Your subscription for #{orgName}'s ${ORGANIZATION_TEXT} will end soon`,
  [EMAIL_TYPE.CANCEL_PLAN_ORGANIZATION.description]: `Your subscription for #{orgName}'s ${ORGANIZATION_TEXT} has been canceled`,
  [EMAIL_TYPE.WELCOME_ORGANIZATION_NEW_PRICING.description]:
    `#{orgName}’s ${ORGANIZATION_TEXT} has been upgraded to Lumin #{plan}`,
  [EMAIL_TYPE.ORGANIZATION_UPGRADE_NEW_PRICING_SUBSCRIPTION.description]:
    `#{orgName}'s ${ORGANIZATION_TEXT} has been upgraded`,
  [EMAIL_TYPE.SUBSCRIPTION_CANCELED_AS_FRAUD_DETECTED.description]: 'Your subscription has been canceled as fraud detected',
  [EMAIL_TYPE.INVITE_MEMBER_TO_ORGANIZATION_SAME_UNPOPULAR_DOMAIN.description]:
    `#{userName} invited you to #{orgName}'s ${ORGANIZATION_TEXT}`,
  [EMAIL_TYPE.MEMBER_GRANTED_TO_ADMIN_WHEN_UPGRADE_SUBSCRIPTION.description]:
    `#{actorName} was granted to Admin of #{orgName}'s ${ORGANIZATION_TEXT}`,
  [EMAIL_TYPE.FIRST_MEMBER_INVITE_COLLABORATOR.description]: `Anyone in #{orgName}'s ${ORGANIZATION_TEXT} can invite members`,
  [EMAIL_TYPE.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY.description]:
    `Your ${ORGANIZATION_TEXT} was auto-changed to visible for anyone to join`,
  [EMAIL_TYPE.USER_JOINS_ORGANIZATION_VIA_INVITE_LINK.description]:
    `#{actorName} joined #{orgName}'s ${ORGANIZATION_TEXT} via an invite link`,
  [EMAIL_TYPE.ORGANIZATION_UPGRADE_MULTI_PRODUCTS.description]:
    `#{orgName}'s ${ORGANIZATION_TEXT} has been upgraded to Lumin premium subscription`,
  [EMAIL_TYPE.ORGANIZATION_UPGRADE_MONTHLY_TO_ANNUAL.description]:
    `You subscription for #{orgName}'s ${ORGANIZATION_TEXT} has been upgraded to an Annual period`,
  [EMAIL_TYPE.WELCOME_ORGANIZATION_SIGN_PRO.description]:
    `#{orgName}'s ${ORGANIZATION_TEXT} has been upgraded to Lumin Sign Pro`,
  [EMAIL_TYPE.SIGN_SUBSCRIPTION_PURCHASE_MORE_SEATS.description]:
    `#{orgName}'s ${ORGANIZATION_TEXT} has been upgraded`,
  [EMAIL_TYPE.ASSIGN_SIGN_SEATS.description]:
    `You’ve been assigned a Lumin Sign Pro seat in #{orgName}'s ${ORGANIZATION_TEXT}`,
  [EMAIL_TYPE.UNASSIGN_SIGN_SEATS.description]:
    `Your Lumin Sign seat has been removed from #{orgName}'s ${ORGANIZATION_TEXT}`,
  [EMAIL_TYPE.REQUEST_SIGN_SEAT.description]:
    '#{requesterName} requested a Lumin Sign Pro Seat',
  [EMAIL_TYPE.REJECT_SIGN_SEAT_REQUEST.description]:
  `Your upgrade request in #{orgName}'s ${ORGANIZATION_TEXT} has been rejected`,
};

export const MappingEmailSettingWithPath = {
  marketingEmail: 'marketingEmail',
  featureUpdateEmail: 'featureUpdateEmail',
  dataCollection: 'dataCollection',
  subscriptionEmail: 'subscriptionEmail',
  shareDocument: 'documentEmail.shareDocument',
  commentDocument: 'documentEmail.commentDocument',
  replyCommentDocument: 'documentEmail.replyCommentDocument',
  mentionCommentDocument: 'documentEmail.mentionCommentDocument',
  requestAccessDocument: 'documentEmail.requestAccessDocument',
  inviteToOrganization: 'organizationEmail.inviteToOrganization',
  inviteToOrganizationTeam: 'organizationEmail.inviteToOrganizationTeam',
};

export const EMAIL_MOBILE_PATH = {
  EMAIL_WELCOME: '/email-welcome',
  EMAIL_DOCUMENT_MENTION: '/email-document-mention',
  EMAIL_DOCUMENT_COMMENT: '/email-document-comment',
  EMAIL_DOCUMENT_REPLY: '/email-document-reply',
  EMAIL_DOCUMENT_SHARE: '/email-document-share',
  EMAIL_DOCUMENT_PERMISSION_REQUEST: '/email-document-permission-request',
  EMAIL_DOCUMENT_PERMISSION_GRANTED: '/email-document-permission-granted',
  EMAIL_ORGANIZATION_CREATED: `/email-${ORG_URL_SEGEMENT}-created`,
  EMAIL_TEAM_INVITATION: `/email-${TEAM_URL_SEGEMENT}-invitation`,
};

export const CAMPAIGN_EMAIL = {
  [EMAIL_MOBILE_PATH.EMAIL_WELCOME]: 'Welcome Email',
  [EMAIL_MOBILE_PATH.EMAIL_DOCUMENT_MENTION]: 'Document Mention Email',
  [EMAIL_MOBILE_PATH.EMAIL_DOCUMENT_COMMENT]: 'Document Comment Email',
  [EMAIL_MOBILE_PATH.EMAIL_DOCUMENT_REPLY]: 'Document Reply Email',
  [EMAIL_MOBILE_PATH.EMAIL_DOCUMENT_SHARE]: 'Document Share Email',
  [EMAIL_MOBILE_PATH.EMAIL_DOCUMENT_PERMISSION_REQUEST]: 'Document Permission Request Email',
  [EMAIL_MOBILE_PATH.EMAIL_DOCUMENT_PERMISSION_GRANTED]: 'Document Permission Granted Email',
  [EMAIL_MOBILE_PATH.EMAIL_ORGANIZATION_CREATED]: `${ORGANIZATION_TEXT} Created Email`,
  [EMAIL_MOBILE_PATH.EMAIL_TEAM_INVITATION]: `${TEAM_TEXT} Invitation Email`,
};

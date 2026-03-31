import { gql } from '@apollo/client';

import { LIMIT_GET_ORGANIZATION_MEMBERS } from 'constants/organizationConstants';

export const OrganizationSettingData = gql`
  fragment OrganizationSettingData on OrganizationSettings {
    other {
      guestInvite
      hideMember
    }
    googleSignIn
    passwordStrength
    templateWorkspace
    domainVisibility
    autoUpgrade
    inviteUsersSetting
    samlSsoConfigurationId
    scimSsoClientId
  }
`;

export const OrganizationPaymentData = gql`
  fragment OrganizationPaymentData on Payment {
    customerRemoteId
    subscriptionRemoteId
    planRemoteId
    type
    period
    status
    quantity
    currency
    priceVersion
    trialInfo {
      highestTrial
      endTrial
      canStartTrial
      canUseStarterTrial
      canUseProTrial
      canUseBusinessTrial
    }
    stripeAccountId
    subscriptionItems {
      id
      quantity
      planRemoteId
      period
      currency
      paymentType
      paymentStatus
      productName
    }
  }
`;

export const OrganizationSsoData = gql`
  fragment OrganizationSsoData on OrganizationSso {
    createdBy
    ssoOrganizationId
    samlSsoConnectionId
    scimSsoClientId
  }
`;

export const OrganizationBase = gql`
  fragment BasicOrganizationData on Organization {
    _id
    name
    avatarRemoteId
    payment {
      ...OrganizationPaymentData
    }
    settings {
      ...OrganizationSettingData
    }
    url
    domain
    associateDomains
    totalMember
    members(options: { limit: ${LIMIT_GET_ORGANIZATION_MEMBERS} }) {
      _id
      name
      avatarRemoteId
    }
    userRole
    convertFromTeam
    deletedAt
    createdAt
    teams {
      _id
      roleOfUser
      name
      avatarRemoteId
    }
    totalTeam
    totalActiveMember
    docStackStorage {
      totalUsed
      totalStack
    }
    availableSignSeats
    totalSignSeats
    isSignProSeat
    signDocStackStorage {
      totalUsed
      totalStack
      isOverDocStack
    }
    hasPendingInvoice
    metadata {
      avatarSuggestion {
        suggestionAvatarRemoteId
      }
    }
    sso {
      ...OrganizationSsoData
    }
  }
  ${OrganizationPaymentData}
  ${OrganizationSettingData}
  ${OrganizationSsoData}
`;

export const OrganizationMembers = gql`
  fragment OrganizationMembers on Organization {
    members(options: { limit: 3 }) {
      _id
      name
      avatarRemoteId
    }
  }
`;

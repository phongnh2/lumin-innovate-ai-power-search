import { gql } from '@apollo/client';

import {
  OrganizationPaymentData,
  OrganizationSettingData,
  OrganizationSsoData,
} from 'graphQL/fragments/OrganizationBase';

export const OrganizationData = gql`
  fragment OrganizationData on Organization {
    _id
    name
    createdAt
    avatarRemoteId
    owner {
      _id
      email
      name
    }
    payment {
      ...OrganizationPaymentData
    }
    billingEmail
    url
    domain
    settings {
      ...OrganizationSettingData
    }
    associateDomains
    creationType
    totalMember
    convertFromTeam
    deletedAt
    # @deprecated
    reachUploadDocLimit
    totalActiveMember
    hasPendingInvoice
    docStackStorage {
      totalUsed
      totalStack
    }
    userRole
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

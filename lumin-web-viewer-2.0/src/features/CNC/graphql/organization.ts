import { gql } from '@apollo/client';

export const GET_SUGGESTED_PREMIUM_ORG_LIST_OF_USER = gql`
  query getSuggestedPremiumOrgListOfUser {
    getSuggestedPremiumOrgListOfUser {
      _id
      name
      url
      avatarRemoteId
      domainVisibility
      paymentStatus
      paymentType
      paymentPeriod
      joinStatus
      members {
        _id
        name
        avatarRemoteId
      }
      totalMember
      owner {
        email
      }
      createdAt
    }
  }
`;

export const GET_GOOGLE_USERS_NOT_IN_CIRCLE = gql`
  query getGoogleUsersNotInCircle($input: GetGoogleUsersNotInCircleInput!) {
    getGoogleUsersNotInCircle(input: $input) {
      _id
      name
      email
      avatarRemoteId
      status
    }
  }
`;

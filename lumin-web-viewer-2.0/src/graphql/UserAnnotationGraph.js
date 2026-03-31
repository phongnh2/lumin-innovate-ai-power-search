import gql from 'graphql-tag';

import fragments from './Fragment';

export const CREATE_USER_ANNOTATION = gql`
  mutation ($input: CreateUserAnnotationInput!) {
    createUserAnnotation(input: $input) {
      ...BasicResponseData
    }
  }
  ${fragments.BasicResponseData}
`;

export const GET_USER_ANNOTATIONS = gql`
  query ($input: GetUserAnnotationInput!) {
    getUserAnnotations(input: $input) {
      total
      data {
        ...RubberStampData
      }
    }
  }
  ${fragments.RubberStampData}
`;

export const REMOVE_USER_ANNOTATION = gql`
  mutation ($id: ID!) {
    removeUserAnnotation(id: $id) {
      ...BasicResponseData
    }
  }
  ${fragments.BasicResponseData}
`;

export const UPDATE_USER_ANNOTATION_POSITION = gql`
  mutation ($input: UpdateUserAnnotationPositionInput!) {
    updateUserAnnotationPosition(input: $input) {
      ...BasicResponseData
    }
  }
  ${fragments.BasicResponseData}
`;

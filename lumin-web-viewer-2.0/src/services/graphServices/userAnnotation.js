import { FETCH_POLICY } from 'constants/graphConstant';

import { client } from '../../apollo';
import {
  CREATE_USER_ANNOTATION,
  GET_USER_ANNOTATIONS,
  REMOVE_USER_ANNOTATION,
  UPDATE_USER_ANNOTATION_POSITION,
} from '../../graphql/UserAnnotationGraph';

export async function createUserAnnotation(input) {
  return client.mutate({
    mutation: CREATE_USER_ANNOTATION,
    variables: {
      input,
    },
  });
}

export async function removeUserAnnotation(id) {
  return client.mutate({
    mutation: REMOVE_USER_ANNOTATION,
    variables: {
      id,
    },
  });
}

export async function updateUserAnnotationPosition(input) {
  return client.mutate({
    mutation: UPDATE_USER_ANNOTATION_POSITION,
    variables: {
      input,
    },
  });
}

export function getUserAnnotations(input) {
  return client.query({
    query: GET_USER_ANNOTATIONS,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: { input },
  });
}

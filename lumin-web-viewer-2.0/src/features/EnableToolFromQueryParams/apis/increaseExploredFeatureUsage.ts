import gql from 'graphql-tag';

import { client } from '@app-apollo';
import { updateCurrentUser } from 'actions/authActions';

import selectors from 'selectors';
import { store } from 'store';

import logger from 'helpers/logger';

import { ExploredFeatures } from '../constants';
import { ExploredFeatureKeys } from '../constants/exploredFeatureKeys';

const { dispatch } = store;

const INCREASE_EXPLORED_FEATURE_USAGE = gql`
  mutation increaseExploredFeatureUsage($input: IncreaseExploredFeatureUsageInput!) {
    increaseExploredFeatureUsage(input: $input) {
      statusCode
      message
    }
  }
`;

export const increaseExploredFeatureUsage = async ({ key }: { key: ExploredFeatureKeys }) => {
  const { metadata } = selectors.getCurrentUser(store.getState());
  try {
    await client.mutate({
      mutation: INCREASE_EXPLORED_FEATURE_USAGE,
      variables: {
        input: {
          key,
        },
      },
    });
    dispatch(
      updateCurrentUser({
        metadata: {
          exploredFeatures: {
            [ExploredFeatures[key]]: Number(metadata?.exploredFeatures?.[ExploredFeatures[key]]) + 1,
          },
        },
      })
    );
  } catch (error: unknown) {
    logger.logError({
      reason: 'INCREASE_EXPLORED_FEATURE_USAGE',
      error,
    });
  }
};

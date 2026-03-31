import { useGrowthBook } from '@growthbook/growthbook-react';
import { isArray, isEqual, orderBy } from 'lodash';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { IUser } from 'interfaces/user/user.interface';

import { useGetAttributesGrowthBook } from './useGetAttributesGrowthBook';

const useCheckFeatureIsLoading = (attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK): { loading: boolean } => {
  const growthbook = useGrowthBook();
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const isCompletedGettingUserData = useSelector<unknown, boolean>(selectors.getIsCompletedGettingUserData);
  const isOffline = useSelector<unknown, boolean>(selectors.isOffline);

  // This attrbutes will setting to GrowthBook;
  const attributes = useGetAttributesGrowthBook();
  const attr = attributes ? attributes[attributeToCheckLoading] : null;

  // This attributes are stored on GrowthBook;
  const attributesGetFromGrowthBook = !growthbook ? {} : (growthbook.getAttributes() as Record<string, unknown>);
  const attrGetFromGrowthBook = attributesGetFromGrowthBook[attributeToCheckLoading];

  const isLoading = () => {
    if ((!currentUser && isCompletedGettingUserData) || isOffline) {
      return false;
    }

    if (!isCompletedGettingUserData) {
      return true;
    }

    if (isArray(attr)) {
      const sortedAttr = orderBy(attr, [], ['asc']);
      const sortedAttrGetFromGrowthBook = orderBy(attrGetFromGrowthBook as string[], [], ['asc']);

      return !isEqual(sortedAttr, sortedAttrGetFromGrowthBook);
    }

    return !isEqual(attr, attrGetFromGrowthBook);
  };

  return {
    loading: isLoading(),
  };
};

export { useCheckFeatureIsLoading };

import { useMutation } from '@tanstack/react-query';
import { get } from 'lodash';
import { useDispatch } from 'react-redux';

import * as userActions from 'actions/userActions';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import userServices from 'services/userServices';

import { USER_METADATA_KEY } from 'constants/userConstants';

export const useQuickSearchGuideline = () => {
  const dispatch = useDispatch();

  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const hasClosedQuickSearchGuideline = get(currentUser, 'metadata.hasClosedQuickSearchGuideline') as boolean;

  const { mutateAsync } = useMutation({
    mutationKey: ['hideQuickSearchGuideline'],
    mutationFn: async () =>
      userServices.updateUserMetadata({ key: USER_METADATA_KEY.HAS_CLOSED_QUICK_SEARCH_GUIDELINE, value: true }),
  });

  const onHideQuickSearchGuideline = async () => {
    dispatch(userActions.updateUserMetadata({ hasClosedQuickSearchGuideline: true }));
    await mutateAsync();
  };

  return {
    hasClosedQuickSearchGuideline,
    onHideQuickSearchGuideline,
  };
};

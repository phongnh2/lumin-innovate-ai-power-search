/* eslint-disable no-restricted-syntax, no-await-in-loop */
import { cloneDeep } from 'lodash';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import manipulation from 'utils/manipulation';

import { PageToolViewMode } from 'constants/documentConstants';

export const useUpdateCroppedThumbs = () => {
  const dispatch = useDispatch();
  const thumbs = useSelector(selectors.getThumbs);
  const pageEditDisplayMode = useShallowSelector(selectors.pageEditDisplayMode);

  const updateCroppedThumbs = useCallback(
    async ({ pageNumbers }: { pageNumbers: number[] }) => {
      if (pageEditDisplayMode === PageToolViewMode.GRID) {
        for (const pageNumber of pageNumbers) {
          const croppedThumb = await manipulation.onLoadThumbs(pageNumber - 1);
          const thumbsUpdate = cloneDeep(thumbs);
          thumbsUpdate[pageNumber - 1] = croppedThumb;
          thumbsUpdate[pageNumber - 1].id = thumbs[pageNumber - 1].id;
          dispatch(actions.updateThumbs(thumbsUpdate));
        }
      }
    },
    [dispatch, thumbs, pageEditDisplayMode]
  );

  return { updateCroppedThumbs };
};

import { useDispatch } from 'react-redux';

import { useCleanup } from 'hooks/useCleanup';

import { closeViewerNavigation } from 'features/ViewerNavigation';

export const useCloseViewerNavigation = () => {
  const dispatch = useDispatch();

  useCleanup(() => dispatch(closeViewerNavigation()), []);
};

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import selectors from 'selectors';

import useAvailablePersonalWorkspace from 'hooks/useAvailablePersonalWorkspace';
import { useCleanup } from 'hooks/useCleanup';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { logger } from 'hooks/zustandStore/logger';

const INVOICE_REGEX = /invoice/i;

export interface IState {
  shouldShowXeroBanner: boolean;
  setShouldShowXeroBanner: (shouldShowXeroBanner: boolean) => void;
}

const createShowXeroBannerSlice: StateCreator<IState, [], [['zustand/immer', never]]> = immer((set) => ({
  shouldShowXeroBanner: false,
  setShouldShowXeroBanner: (shouldShowXeroBanner) => set({ shouldShowXeroBanner }),
}));

export const useShowXeroBannerStore = create<IState, [['zustand/immer', never]]>(
  logger(createShowXeroBannerSlice, 'useShowXeroBannerStore')
);

export const useShowXeroBanner = () => {
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isOffline = useSelector(selectors.isOffline);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isAnnotationsLoaded = useSelector(selectors.getAnnotationsLoaded);
  const isProfessionalUser = useAvailablePersonalWorkspace();

  useEffect(() => {
    const shouldShowXeroBanner = INVOICE_REGEX.test(currentDocument?.name ?? '');
    if (!isOffline && currentUser?._id && shouldShowXeroBanner && isAnnotationsLoaded && !isProfessionalUser) {
      useShowXeroBannerStore.getState().setShouldShowXeroBanner(true);
    }
  }, [isOffline, currentUser?._id, currentDocument?.name, isAnnotationsLoaded, isProfessionalUser]);

  useCleanup(() => {
    useShowXeroBannerStore.getState().setShouldShowXeroBanner(false);
  }, []);

  return true;
};

import { ElementName } from '@/constants/common';
import { RootState } from '@/lib/reducers';

export const isElementOpen = (state: RootState, dataElement: ElementName) => {
  return state.visibility.openElements[dataElement];
};

export const isModalProcessing = (state: RootState) => {
  return state.modalData.isProcessing;
};

export const cookieConsentsLoaded = (state: RootState) => {
  return state.common.cookieConsentsLoaded;
};

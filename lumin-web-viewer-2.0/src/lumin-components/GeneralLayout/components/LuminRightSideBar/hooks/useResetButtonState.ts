import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { LayoutElements } from '@new-ui/constants';

import selectors from 'selectors';

import { usePrevious } from 'hooks/usePrevious';

interface IProps {
  onChangeLayout: (layout: string) => void;
}

export const useResetButtonState = ({ onChangeLayout }: IProps) => {
  const isDefaultMode = useSelector(selectors.isDefaultMode);
  const isPreviousDefaultModeValue = usePrevious(isDefaultMode);
  const isSearchOverlayOpen = useSelector(selectors.isOpenSearchOverlay);

  useEffect(() => {
    if (!isDefaultMode && isPreviousDefaultModeValue && isSearchOverlayOpen) {
      onChangeLayout(LayoutElements.SEARCH_OVERLAY);
    }
  }, [isDefaultMode, isPreviousDefaultModeValue, isSearchOverlayOpen, onChangeLayout]);
};

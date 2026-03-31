import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LayoutElements } from '@new-ui/constants';

import actions from 'actions';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { readAloudSelectors } from 'features/ReadAloud/slices';

export const useEnableRightSideBarTool = () => {
  const dispatch = useDispatch();
  const isDefaultMode = useSelector(selectors.isDefaultMode);
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const toolPropertiesValue = useShallowSelector(selectors.toolPropertiesValue);
  const shouldEnableRightSideBarTool =
    isDefaultMode && !isInReadAloudMode && toolPropertiesValue !== TOOL_PROPERTIES_VALUE.MEASURE;

  useEffect(() => {
    if (!shouldEnableRightSideBarTool) {
      dispatch(actions.setIsRightPanelOpen(false));
      dispatch(actions.setRightPanelValue(LayoutElements.DEFAULT));
    }
  }, [dispatch, shouldEnableRightSideBarTool]);

  return {
    enabled: shouldEnableRightSideBarTool,
  };
};

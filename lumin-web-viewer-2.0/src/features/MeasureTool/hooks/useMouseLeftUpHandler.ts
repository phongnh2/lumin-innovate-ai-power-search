import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import { useLatestRef } from 'hooks/useLatestRef';

import { measureToolActions, measureToolSelectors } from 'features/MeasureTool/slices';

import { IToolName } from 'constants/toolsName';

import { MEASUREMENT_TOOLS } from '../constants/toolName';

export const useMouseLeftUpHandler = () => {
  const dispatch = useDispatch();
  const scales = useSelector(measureToolSelectors.getScales);
  const activeToolName = useSelector(selectors.getActiveToolName);
  const activeToolNameRef = useLatestRef(activeToolName);

  useEffect(() => {
    const onMouseLeftUp = () => {
      if (!scales.length && MEASUREMENT_TOOLS.includes(activeToolNameRef.current as IToolName)) {
        dispatch(
          measureToolActions.setConfigModal({
            isOpen: true,
            action: 'create',
          })
        );
      }
    };

    core.addEventListener('mouseLeftUp', onMouseLeftUp);
    return () => {
      core.removeEventListener('mouseLeftUp', onMouseLeftUp);
    };
  }, [scales.length, activeToolNameRef, dispatch]);
};

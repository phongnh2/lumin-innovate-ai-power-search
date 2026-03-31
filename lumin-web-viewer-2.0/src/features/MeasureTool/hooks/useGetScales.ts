import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import core from 'core';

import { measureToolActions } from '../slices';
import { getScalesInfo } from '../utils/getScaleInfo';

export const useGetScales = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const coreScales = core.getMeasurementManager().getScales();
    const documentScales = Object.keys(coreScales).map((scale) => {
      const precision = core.getMeasurementManager().getScalePrecision(scale);
      return new Core.Scale(scale, precision);
    });
    if (!documentScales || documentScales.length === 0) {
      dispatch(measureToolActions.setScales([]));
      dispatch(measureToolActions.setSelectedScale(null));
      return;
    }
    const scalesInfo = getScalesInfo(documentScales);
    dispatch(measureToolActions.setScales(scalesInfo));
    dispatch(measureToolActions.setSelectedScale(scalesInfo[0]));
  }, []);
};

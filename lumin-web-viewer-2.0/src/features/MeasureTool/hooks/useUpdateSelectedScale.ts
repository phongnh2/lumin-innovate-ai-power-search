import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import core from 'core';

import { useLatestRef } from 'hooks';

import { measureToolActions, measureToolSelectors } from '../slices';
import { getScalesInfo } from '../utils/getScaleInfo';
import { isMeasurementExcludedCalibration } from '../utils/isMeasurementAnnotation';

export const useUpdateSelectedScale = ({
  setIsSelectMultiple,
}: {
  setIsSelectMultiple: (isSelectMultiple: boolean) => void;
}) => {
  const dispatch = useDispatch();
  const scaleStateRef = useLatestRef(useSelector(measureToolSelectors.getScales));

  useEffect(() => {
    const onAnnotationSelected = (annotationList: Core.Annotations.Annotation[], action: string) => {
      if (action === 'selected') {
        core.getMeasurementManager().getScales();
        const updatedScales = annotationList
          .filter(isMeasurementExcludedCalibration)
          .reduce((scales: Core.Scale[], item: Core.Annotations.Annotation) => {
            const { scale } = item.Measure;
            const precision = core.getMeasurementManager().getScalePrecision(scale);
            return scales.some((s) => s.toString() === scale.toString())
              ? scales
              : [...scales, new Core.Scale(scale, precision)];
          }, []);
        const scaleInfos = getScalesInfo(updatedScales);
        if (scaleInfos.length > 1) {
          setIsSelectMultiple(true);
          return;
        }
        if (scaleInfos.length === 0) {
          return;
        }
        const hasScale = scaleStateRef.current.find((scale) => scale.title === scaleInfos[0].title);
        if (!hasScale) {
          dispatch(measureToolActions.addScale(scaleInfos[0]));
        }
        dispatch(measureToolActions.setSelectedScale(scaleInfos[0]));
      } else {
        setIsSelectMultiple(false);
      }
    };

    core.addEventListener('annotationSelected', onAnnotationSelected);

    return () => {
      core.removeEventListener('annotationSelected', onAnnotationSelected);
    };
  }, []);
};

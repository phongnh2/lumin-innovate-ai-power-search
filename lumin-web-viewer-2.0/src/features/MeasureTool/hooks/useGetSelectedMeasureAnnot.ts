import { useEffect, useState } from 'react';

import core from 'core';

import { isMeasurementExcludedCalibration } from '../utils/isMeasurementAnnotation';

export const useGetSelectedMeasureAnnot = () => {
  const [selectedMeasureAnnot, setSelectedMeasureAnnot] = useState<Core.Annotations.Annotation[]>([]);

  const getSelectedMeasureAnnot = () => {
    const selectedAnnotations = core.getSelectedAnnotations();
    const updatedScales = selectedAnnotations.filter(isMeasurementExcludedCalibration);
    setSelectedMeasureAnnot(updatedScales);
  };

  useEffect(() => {
    const onAnnotationSelected = () => {
      getSelectedMeasureAnnot();
    };
    core.addEventListener('annotationSelected', onAnnotationSelected);

    return () => {
      core.removeEventListener('annotationSelected', onAnnotationSelected);
    };
  }, []);

  useEffect(() => {
    getSelectedMeasureAnnot();
  }, []);

  return {
    selectedMeasureAnnot,
    isSelectedMultiple: selectedMeasureAnnot.length > 1,
  };
};

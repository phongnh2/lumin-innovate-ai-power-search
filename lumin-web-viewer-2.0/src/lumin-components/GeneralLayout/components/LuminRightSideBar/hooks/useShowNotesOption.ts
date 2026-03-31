import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';

import { LayoutElements } from '@new-ui/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { ShowValues } from 'constants/sortStrategies';

export const useShowNotesOption = () => {
  const dispatch = useDispatch();
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);
  const rightPanelValue = useSelector(selectors.rightPanelValue);

  const setShowNotesOption = useCallback(
    (option: string) => {
      dispatch(actions.setShowNotesOption(option) as AnyAction);
    },
    [dispatch]
  );

  useEffect(() => {
    if (rightPanelValue === LayoutElements.DEFAULT && !isRightPanelOpen) {
      setShowNotesOption(ShowValues.SHOW_ALL);

      const selectedAnnots = core.getSelectedAnnotations();
      const filteredAnnotations = selectedAnnots.filter(
        (annot) => annot.Subject !== AnnotationSubjectMapping.stickyNote
      );

      if (filteredAnnotations) {
        filteredAnnotations.forEach((annot) => core.deselectAnnotation(annot));
      }
    }
  }, [rightPanelValue, isRightPanelOpen, setShowNotesOption]);
};

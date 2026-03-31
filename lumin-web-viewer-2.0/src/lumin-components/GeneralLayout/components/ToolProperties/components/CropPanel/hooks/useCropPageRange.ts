import { useEffect, useRef } from 'react';

import { PAGE_RANGE_OPTIONS } from '@new-ui/components/PageRangeSelection/constants';
import { PageRangeType } from '@new-ui/components/PageRangeSelection/types';

import core from 'core';

import { isCropAnnotation } from '../helpers/isCropAnnotation';
import { getCropPageNumbers } from '../utils/getCropPageNumbers';

interface UseCropPageRangeProps {
  cropMode: PageRangeType;
  pageRangeValue: string;
  setCropMode: (cropMode: PageRangeType) => void;
  setPageRangeValue: (value: string, isValid: boolean) => void;
}

export const useCropPageRange = ({ cropMode, pageRangeValue, setPageRangeValue }: UseCropPageRangeProps) => {
  const toolMode = core.docViewer.getToolMode();
  const previousCropMode = useRef(null);
  const hiddenAnnotationsRef = useRef<Core.Annotations.Annotation[]>([]);

  const mappingCropMode = (mode: PageRangeType) => {
    if (previousCropMode.current === PAGE_RANGE_OPTIONS.SPECIFIC_PAGES) {
      core.showAnnotations(hiddenAnnotationsRef.current);
    }
    switch (mode) {
      case PAGE_RANGE_OPTIONS.ALL_PAGES:
        return window.Core.Tools.CropCreateTool.CropModes.ALL_PAGES;
      case PAGE_RANGE_OPTIONS.CURRENT_PAGE:
        return window.Core.Tools.CropCreateTool.CropModes.SINGLE_PAGE;
      case PAGE_RANGE_OPTIONS.SPECIFIC_PAGES:
        return window.Core.Tools.CropCreateTool.CropModes.MULTI_PAGE;
      default:
        return window.Core.Tools.CropCreateTool.CropModes.ALL_PAGES;
    }
  };

  const specificPageCropHandler = () => {
    const totalPages = core.getTotalPages();
    const multiCropPageNumbers = getCropPageNumbers(cropMode, pageRangeValue, totalPages);

    if (multiCropPageNumbers.length && toolMode instanceof window.Core.Tools.CropCreateTool) {
      toolMode.setCropMode(window.Core.Tools.CropCreateTool.CropModes.ALL_PAGES);
      const allCropAnnotations = core.docViewer.getAnnotationManager().getAnnotationsList().filter(isCropAnnotation);

      const visibleAnnotations: Core.Annotations.Annotation[] = [];
      const hiddenAnnotations: Core.Annotations.Annotation[] = [];

      allCropAnnotations.forEach((annotation) => {
        if (multiCropPageNumbers.includes(annotation.PageNumber)) {
          visibleAnnotations.push(annotation);
        } else {
          hiddenAnnotations.push(annotation);
        }
      });

      hiddenAnnotationsRef.current = hiddenAnnotations;
      if (hiddenAnnotations.length) {
        core.hideAnnotations(hiddenAnnotations);
      }

      if (visibleAnnotations.length) {
        core.showAnnotations(visibleAnnotations);
        core.selectAnnotation(visibleAnnotations[0]);
      }
    }
  };

  useEffect(() => {
    if (!(toolMode instanceof window.Core.Tools.CropCreateTool)) {
      return;
    }

    if (previousCropMode.current !== PAGE_RANGE_OPTIONS.CURRENT_PAGE && cropMode === PAGE_RANGE_OPTIONS.CURRENT_PAGE) {
      setPageRangeValue(core.getCurrentPage().toString(), true);
    }

    if (cropMode === PAGE_RANGE_OPTIONS.SPECIFIC_PAGES || pageRangeValue.length) {
      specificPageCropHandler();
    } else {
      toolMode.setCropMode(mappingCropMode(cropMode));
    }
    previousCropMode.current = cropMode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolMode, cropMode, pageRangeValue, setPageRangeValue]);
};

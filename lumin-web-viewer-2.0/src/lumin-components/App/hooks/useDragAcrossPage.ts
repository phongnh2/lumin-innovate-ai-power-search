import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import useLatestRef from 'hooks/useLatestRef';

type AnnotPosition = { x: number; y: number; instance: Core.Annotations.Annotation; id: string };
type AnnotPositions = AnnotPosition[];

/**
 * @description We need to fix the position of the annotations when dragging across pages due to Apryse SDK bug.
 */
export const useDragAcrossPage = () => {
  const isMultipleSelectRef = useRef(false);
  const [annotPositions, setAnnotPositions] = useState<AnnotPositions>([]);
  const annotPositionsRef = useLatestRef<AnnotPositions>(annotPositions);
  const pageNumberRef = useRef<number>(undefined);
  const isConvertingBase64ToSignedUrl = useSelector<unknown, boolean>(selectors.isConvertingBase64ToSignedUrl);

  const isAnnotConvertingSignedUrl = (annot: Core.Annotations.Annotation) => annot.NoDelete;

  const flushAnnotPositions = () => setAnnotPositions([]);

  const getAnnotCoordinations = ({
    annotRect,
  }: {
    annotRect: { x: number; y: number; width: number; height: number };
  }) => ({ x: annotRect.x, y: annotRect.y });

  const redrawAnnotations = () => {
    const annotations = annotPositionsRef.current;
    /**
     * Redraw other annots based on the first annot's position.
     */
    if (annotations.length > 1) {
      const { instance: firstAnnot } = annotations[0];
      annotations.slice(1).forEach(({ instance: annot, x, y }) => {
        const annotCoordinations = getAnnotCoordinations({
          annotRect: {
            x: firstAnnot.X + x,
            y: firstAnnot.Y + y,
            width: annot.Width,
            height: annot.Height,
          },
        });
        annot.setX(annotCoordinations.x);
        annot.setY(annotCoordinations.y);
      });
    }
  };

  const annotationDeselected = (annotations: Core.Annotations.Annotation[]) => {
    isMultipleSelectRef.current = annotations.length > 1;
    if (isMultipleSelectRef.current) {
      flushAnnotPositions();
    }
  };

  const toggleDragAcrossPage = (annotations: Core.Annotations.Annotation[]) => {
    const disableDragAcrossPage = annotations.some((annot) => isAnnotConvertingSignedUrl(annot));

    const annotManager = core.getAnnotationManager();
    const formFieldCreationManager = core.getFormFieldCreationManager();
    if (disableDragAcrossPage || formFieldCreationManager.isInFormFieldCreationMode()) {
      annotManager.disableDraggingAcrossPages();
    } else {
      annotManager.enableDraggingAcrossPages();
    }
  };

  const onAnnotationSelected = (annotations: Core.Annotations.Annotation[]) => {
    toggleDragAcrossPage(annotations);
    isMultipleSelectRef.current = annotations.length > 1;
    if (isMultipleSelectRef.current) {
      const positions = annotations.map((annot) => {
        const { X, Y, Id } = annot;
        return { x: X - annotations[0].X, y: Y - annotations[0].Y, instance: annot, id: Id };
      });
      setAnnotPositions(positions);
    }
  };

  const onAnnotationsDrawn = (pageNumber: number) => {
    const isDraggingAcrossPage = pageNumberRef.current !== pageNumber;
    if (isDraggingAcrossPage && isMultipleSelectRef.current) {
      redrawAnnotations();
    }
    pageNumberRef.current = pageNumber;
  };

  useEffect(() => {
    const annotManager = core.getAnnotationManager();
    if (isConvertingBase64ToSignedUrl) {
      annotManager.disableDraggingAcrossPages();
    } else {
      annotManager.enableDraggingAcrossPages();
    }
  }, [isConvertingBase64ToSignedUrl]);

  useEffect(() => {
    core.addEventListener('annotationSelected', onAnnotationSelected);
    core.addEventListener('annotationDeselected', annotationDeselected);
    core.addEventListener('annotationsDrawn', onAnnotationsDrawn);
    return () => {
      core.removeEventListener('annotationSelected', onAnnotationSelected);
      core.removeEventListener('annotationDeselected', annotationDeselected);
      core.removeEventListener('annotationsDrawn', onAnnotationsDrawn);
    };
  }, []);
};

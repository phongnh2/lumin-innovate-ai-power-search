import { useState } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import setToolStyles from 'helpers/setToolStyles';

import { useGetMeasureAnnotationInfo } from 'features/MeasureTool/hooks/useGetMeasureAnnotationInfo';
import { useGetSelectedMeasureAnnot } from 'features/MeasureTool/hooks/useGetSelectedMeasureAnnot';
import { hasFillProperty, isSelectedToolMeasure } from 'features/MeasureTool/utils/isMeasurementAnnotation';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

export const useMeasureToolPanel = () => {
  const [color, setColor] = useState(new Core.Annotations.Color(0, 0, 0, 1));
  const [opacity, setOpacity] = useState(1);
  const [fillColor, setFillColor] = useState(new Core.Annotations.Color(0, 0, 0, 1));
  const [strokeWidth, setStrokeWidth] = useState(1);
  const { selectedMeasureAnnot, isSelectedMultiple } = useGetSelectedMeasureAnnot();
  const activeToolName = useSelector(selectors.getActiveToolName);
  const isSelectedTool = isSelectedToolMeasure(activeToolName);
  const isDisabledPropertiesPanel = isSelectedTool && selectedMeasureAnnot.length === 0;
  const { headerProperties, bodyProperties } = useGetMeasureAnnotationInfo(selectedMeasureAnnot[0]);
  const hasStroke = bodyProperties.stroke;
  const hasFill = selectedMeasureAnnot ? bodyProperties.fill : hasFillProperty(activeToolName);
  const hasOpacity = bodyProperties.opacity;

  const handleStrokeColorChange = (_: string, colorChanged: Core.Annotations.Color) => {
    if (selectedMeasureAnnot.length === 0) {
      setToolStyles(activeToolName, ANNOTATION_STYLE.STROKE_COLOR, colorChanged);
    } else {
      selectedMeasureAnnot.forEach((annot) => {
        if (!isDisabledPropertiesPanel) {
          core.setAnnotationStyles(annot, {
            [ANNOTATION_STYLE.STROKE_COLOR]: colorChanged,
          });
        }
        setToolStyles(annot.ToolName, ANNOTATION_STYLE.STROKE_COLOR, colorChanged);
      });
    }
    setColor(colorChanged);
  };

  const handleFillColorChange = (_: string, colorChanged: Core.Annotations.Color) => {
    if (selectedMeasureAnnot.length === 0) {
      setToolStyles(activeToolName, ANNOTATION_STYLE.FILL_COLOR, colorChanged);
    } else {
      selectedMeasureAnnot.forEach((annot) => {
        if (!isDisabledPropertiesPanel) {
          core.setAnnotationStyles(annot, {
            [ANNOTATION_STYLE.FILL_COLOR]: colorChanged,
          });
        }
        setToolStyles(annot.ToolName, ANNOTATION_STYLE.FILL_COLOR, colorChanged);
      });
    }
    setFillColor(colorChanged);
  };
  const handleOpacityChange = (_: string, opacityChanged: number) => {
    if (selectedMeasureAnnot.length === 0) {
      setToolStyles(activeToolName, ANNOTATION_STYLE.OPACITY, opacityChanged);
    } else {
      selectedMeasureAnnot.forEach((annot) => {
        if (!isDisabledPropertiesPanel) {
          core.setAnnotationStyles(annot, {
            [ANNOTATION_STYLE.OPACITY]: opacityChanged,
          });
        }
        setToolStyles(annot.ToolName, ANNOTATION_STYLE.OPACITY, opacityChanged);
      });
    }
    setOpacity(opacityChanged);
  };

  const handleStrokeWidthChange = (_: string, value: number) => {
    if (selectedMeasureAnnot.length === 0) {
      setToolStyles(activeToolName, ANNOTATION_STYLE.STROKE_THICKNESS, value);
    } else {
      selectedMeasureAnnot.forEach((annot) => {
        if (!isDisabledPropertiesPanel) {
          core.setAnnotationStyles(annot, {
            [ANNOTATION_STYLE.STROKE_THICKNESS]: value,
          });
        }
        setToolStyles(annot.ToolName, ANNOTATION_STYLE.STROKE_THICKNESS, value);
      });
    }
    setStrokeWidth(value);
  };
  return {
    color,
    opacity,
    fillColor,
    strokeWidth,
    isSelectedMultiple,
    headerProperties,
    hasStroke,
    hasFill,
    hasOpacity,
    selectedMeasureAnnot,
    isSelectedTool,
    setColor,
    setOpacity,
    setFillColor,
    setStrokeWidth,
    handleStrokeColorChange,
    handleFillColorChange,
    handleOpacityChange,
    handleStrokeWidthChange,
  };
};

import PropTypes from 'prop-types';
import React from 'react';

import RedactStylePalette from '@new-ui/general-components/RedactStylePalette';

import ShapeToolsStylePalette from 'lumin-components/GeneralLayout/components/ShapeToolsStylePalette';
import StylePalette from 'lumin-components/GeneralLayout/components/StylePalette';

import { TOOLS_NAME } from 'constants/toolsName';

import StrokeStylePalette from '../../StrokeStylePalette';
import TextToolStylePalette from '../../TextToolStylePalette';

const isTextTool = (toolName) =>
  [TOOLS_NAME.SQUIGGLY, TOOLS_NAME.UNDERLINE, TOOLS_NAME.STRIKEOUT, TOOLS_NAME.HIGHLIGHT].some(
    (tool) => tool === toolName
  );

const isStrokeTool = (toolName) =>
  [TOOLS_NAME.FREEHAND_HIGHLIGHT, TOOLS_NAME.FREEHAND].some((tool) => tool === toolName);

const isShapeTool = (toolName) =>
  [
    TOOLS_NAME.ELLIPSE,
    TOOLS_NAME.ARROW,
    TOOLS_NAME.POLYLINE,
    TOOLS_NAME.RECTANGLE,
    TOOLS_NAME.LINE,
    TOOLS_NAME.POLYGON,
    TOOLS_NAME.POLYGON_CLOUD,
    TOOLS_NAME.STAR,
    TOOLS_NAME.CROSS,
    TOOLS_NAME.TICK,
  ].some((tool) => tool === toolName);

const isRedactTool = (toolName) => toolName === TOOLS_NAME.REDACTION;

const AnnotationStylePalette = ({ annotation, style }) => {
  if (isStrokeTool(annotation.ToolName) ) {
    return <StrokeStylePalette annotation={annotation} style={style} />;
  }

  if (isTextTool(annotation.ToolName)) {
    return <TextToolStylePalette annotation={annotation} style={style} />;
  }

  if (isShapeTool(annotation.ToolName)) {
    return <ShapeToolsStylePalette forTool={annotation.ToolName} annotation={annotation} style={style} />;
  }

  if (isRedactTool(annotation.ToolName)) {
    return <RedactStylePalette annotation={annotation} style={style} />;
  }

  return <StylePalette annotation={annotation} style={style} showTextDecoration />;
};

AnnotationStylePalette.propTypes = {
  annotation: PropTypes.object.isRequired,
  style: PropTypes.object.isRequired,
};

export default AnnotationStylePalette;

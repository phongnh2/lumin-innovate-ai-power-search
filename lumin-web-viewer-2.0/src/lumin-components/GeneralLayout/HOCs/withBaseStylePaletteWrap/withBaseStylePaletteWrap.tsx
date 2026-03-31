import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import core from 'core';
import selectors from 'selectors';

import resizeFreetextToFitContent from 'helpers/resizeFreetextToFitContent';
import setToolStyles from 'helpers/setToolStyles';

import { ANNOTATION_STYLE } from 'constants/documentConstants';
import { spacings } from 'constants/styles/editor';
import { TOOLS_NAME } from 'constants/toolsName';

import { IAnnotationStyle } from 'interfaces/viewer/viewer.interface';

export interface IHOCProps {
  annotation: Core.Annotations.Annotation;
  style: IAnnotationStyle;
}

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_2}px;
`;

function withBaseStylePaletteWrap<T>(
  Component: React.ComponentType<T>,
  contentWidth?: number,
  contentPadding?: number
): (props: T) => JSX.Element {
  function HOC(props: T & IHOCProps): JSX.Element {
    const activeToolName = useSelector(selectors.getActiveToolName);
    const activeToolStyles = useSelector(selectors.getActiveToolStyles);

    const style = props.style || activeToolStyles;

    const onChange = (property: string, value: number | string | object): void => {
      const obj = {
        [property]: value,
      };
      const { annotation } = props;
      if (annotation) {
        core.setAnnotationStyles(annotation, obj);

        if (property === ANNOTATION_STYLE.FONT_SIZE) {
          core.getAnnotationManager().redrawAnnotation(annotation);
          resizeFreetextToFitContent(annotation);
        }
        const stampTools: string[] = [TOOLS_NAME.SIGNATURE, TOOLS_NAME.STAMP, TOOLS_NAME.RUBBER_STAMP];
        if (property !== ANNOTATION_STYLE.FONT_STYLE && !stampTools.includes(annotation.ToolName)) {
          setToolStyles(annotation.ToolName, property, value);
        }
        return;
      }
      core.getTool(activeToolName).setStyles(obj);
    };

    return (
      <StyledWrapper
        style={{
          ...(Number.isFinite(contentWidth) && { maxWidth: `${contentWidth}px`, width: '100%', minWidth: 300 }),
          padding: `${Number.isFinite(contentPadding) ? contentPadding : spacings.le_gap_2}px`,
        }}
        data-cy="base_style_palette_wrapper"
      >
        <Component {...props} onChange={onChange} style={style} />
      </StyledWrapper>
    );
  }

  return HOC;
}

export default withBaseStylePaletteWrap;

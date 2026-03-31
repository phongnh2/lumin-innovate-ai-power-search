import dayjs from 'dayjs';
import inRange from 'lodash/inRange';
import rafSchd from 'raf-schd';
import React, { useEffect, useMemo, useState } from 'react';

import { RICH_STYLE_KEYS, RICH_STYLE_VALUES } from '@new-ui/general-components/TextStylePalette/constants';
import { useUpdateDefaultRichStyles } from '@new-ui/general-components/TextStylePalette/hooks/useUpdateDefaultRichStyles';
import {
  FontStylesTypes,
  FontWeightsTypes,
  RichStyleTypes,
  TextDecorationsTypes,
} from '@new-ui/general-components/TextStylePalette/type';

import core from 'core';

import { TOOLS_NAME } from 'constants/toolsName';

import { IRGBAColor } from 'interfaces/viewer/viewer.interface';

import * as Styled from './FreeTextPreview.styled';

interface IFreeTextPreview {
  activeToolName: string;
  activeToolStyle: {
    Font: string;
    Opacity: number;
    FontSize: string;
    TextColor: IRGBAColor;
    FillColor: IRGBAColor;
    StrokeColor: IRGBAColor;
    StrokeThickness: number;
  };
  isElementOpen: boolean;
}

const FreeTextPreview = ({ activeToolName, activeToolStyle, isElementOpen }: IFreeTextPreview) => {
  const [hide, setHide] = useState<boolean>(true);
  const [isMousePositionInPage, setMousePositionInPage] = useState(false);
  const [isSelectedAnnotation, setIsSelectedAnnotation] = useState(false);
  const [richTextStyles, setRichTextStyles] = useState<RichStyleTypes | null>(null);

  const extractColor = (color: IRGBAColor) => {
    if (!color) {
      return null;
    }
    return `rgba(${color.R}, ${color.G}, ${color.B}, ${color.A})`;
  };

  const { defaultRichStyles } = useUpdateDefaultRichStyles();
  const fontStyle = defaultRichStyles?.[0]?.[RICH_STYLE_KEYS.FONT_STYLE];
  const fontWeight = defaultRichStyles?.[0]?.[RICH_STYLE_KEYS.FONT_WEIGHT];
  const textDecoration = defaultRichStyles?.[0]?.[RICH_STYLE_KEYS.TEXT_DECORATION];

  const { StrokeColor, StrokeThickness, FillColor, TextColor, FontSize, Font } = activeToolStyle;

  const isFreeTextToolActive = activeToolName === TOOLS_NAME.FREETEXT || activeToolName === TOOLS_NAME.DATE_FREE_TEXT;
  const currentTool = core.getToolMode();
  const dateFormat =
    activeToolName === TOOLS_NAME.DATE_FREE_TEXT && currentTool instanceof Core.Tools.DateFreeTextCreateTool
      ? currentTool.getDateFormat()
      : null;
  const [overlayPosition, setOverlayPosition] = useState({
    left: 0,
    top: 0,
  });

  const fitWindowSize = (e: MouseEvent) => {
    const left = e.clientX + 2;
    const top = e.clientY + 2;
    return { left, top };
  };

  const onMouseMove = (e: MouseEvent) => {
    const { left, top } = fitWindowSize(e);
    setOverlayPosition({ left, top });
    const { pageNumber } = core.getViewerCoordinatesFromMouseEvent(e);
    const pageContainer = document.getElementById(`pageContainer${pageNumber}`);
    const currentPageInfo = pageContainer.getBoundingClientRect();
    const isMouseInPage =
      inRange(left, currentPageInfo.left, currentPageInfo.right) &&
      inRange(top, currentPageInfo.top, currentPageInfo.bottom);
    setMousePositionInPage(isMouseInPage);
  };

  useEffect(() => {
    const onMouseMoveThrottle = rafSchd(onMouseMove);
    const onAnnotationSelected = () => setIsSelectedAnnotation(core.getSelectedAnnotations().length > 0);

    if (isFreeTextToolActive) {
      core.docViewer.addEventListener('mouseMove', onMouseMoveThrottle);
      core.addEventListener('annotationSelected', onAnnotationSelected);
      return () => {
        core.docViewer.removeEventListener('mouseMove', onMouseMoveThrottle);
        core.removeEventListener('annotationSelected', onAnnotationSelected);
      };
    }
  }, [isFreeTextToolActive]);

  useEffect(() => {
    setHide(!isMousePositionInPage || !isFreeTextToolActive || isSelectedAnnotation || !isElementOpen);
  }, [isMousePositionInPage, isFreeTextToolActive, isSelectedAnnotation, isElementOpen]);

  const previewText = useMemo(() => {
    if (!isFreeTextToolActive) {
      return '';
    }
    if (activeToolName === TOOLS_NAME.DATE_FREE_TEXT && dateFormat) {
      return dayjs().format(dateFormat);
    }

    return (core.getToolMode() as Core.Tools.FreeTextCreateTool & { initialText: string }).initialText;
  }, [activeToolName, dateFormat]);

  useEffect(() => {
    if (!fontWeight || !fontStyle || !textDecoration) return;

    const extractedDecoration = textDecoration
      .replace(RICH_STYLE_VALUES.NONE, '')
      .replace(RICH_STYLE_VALUES.WORD, RICH_STYLE_VALUES.UNDERLINE);

    setRichTextStyles({
      [RICH_STYLE_KEYS.FONT_STYLE]: fontStyle as FontStylesTypes,
      [RICH_STYLE_KEYS.FONT_WEIGHT]: fontWeight as FontWeightsTypes,
      [RICH_STYLE_KEYS.TEXT_DECORATION]: extractedDecoration as TextDecorationsTypes,
    });
  }, [fontWeight, fontStyle, textDecoration]);

  if (!isFreeTextToolActive) {
    return null;
  }

  return (
    <Styled.PreviewField
      style={{
        ...({
          '--display': hide ? 'none' : 'flex',
          '--zoom': core.getZoom(),
          '--font': Font,
          '--font-size': FontSize ? `${parseInt(FontSize?.split('pt')[0])}px` : null,
          '--fill-color': extractColor(FillColor),
          '--text-color': extractColor(TextColor),
          '--stroke-color': extractColor(StrokeColor),
          '--stroke-thickness': `${StrokeThickness}px`,
          '--font-weight': richTextStyles?.[RICH_STYLE_KEYS.FONT_WEIGHT],
          '--font-style': richTextStyles?.[RICH_STYLE_KEYS.FONT_STYLE],
          '--text-decoration': richTextStyles?.[RICH_STYLE_KEYS.TEXT_DECORATION],
        } as React.CSSProperties),
        ...overlayPosition,
      }}
    >
      <Styled.PreviewText>{previewText}</Styled.PreviewText>
    </Styled.PreviewField>
  );
};

export default FreeTextPreview;

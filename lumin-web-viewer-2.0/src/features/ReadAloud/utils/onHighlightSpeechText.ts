import { rgba } from 'polished';

import core from 'core';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';

import { HIGHLIGHT_TEXT_OPACITY } from '../constants';

export interface IScrollBehavior {
  isScrolling: boolean;
  verticalOffset: number;
}

interface IOnHighlightSpeechText {
  to: number;
  from: number;
  pageNumber: number;
  strokeColor: string;
  scrollBehavior: IScrollBehavior;
}

export const onDeleteSpeechTextHighlighted = () => {
  const annotationManager = core.getAnnotationManager();
  annotationManager.getAnnotationsList().forEach((annot) => {
    if (annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_SPEECH_TEXT_HIGHLIGHTED)) {
      core.deleteAnnotations([annot], {
        force: true,
        imported: true,
      });
    }
  });
};

export const onHighlightSpeechText = async (props: IOnHighlightSpeechText) => {
  const { from, to, pageNumber, strokeColor, scrollBehavior } = props;

  const rgbaStrokeColor = rgba(strokeColor, HIGHLIGHT_TEXT_OPACITY);

  const listTextPosition = await core.getTextPosition(pageNumber, from, to);

  const color: number[] = rgbaStrokeColor
    ? rgbaStrokeColor
        .slice(rgbaStrokeColor.indexOf('(') + 1, -1)
        .split(',')
        .map((item) => parseInt(item))
    : [0, 0, 0, 0];

  const annotationManager = core.getAnnotationManager();

  const annot = new window.Core.Annotations.TextHighlightAnnotation({
    PageNumber: pageNumber,
    Quads: listTextPosition,
    StrokeColor: new window.Core.Annotations.Color(color[0], color[1], color[2], color[3] || HIGHLIGHT_TEXT_OPACITY),
  });

  if (!scrollBehavior.isScrolling && scrollBehavior.verticalOffset <= annot.Quads[0].y1) {
    core.jumpToAnnotation(annot, { isSmoothScroll: true });
  }

  onDeleteSpeechTextHighlighted();

  annot.setCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_SPEECH_TEXT_HIGHLIGHTED, 'true');
  annotationManager.addAnnotation(annot, {
    imported: true,
  });
  annotationManager.redrawAnnotation(annot);
};

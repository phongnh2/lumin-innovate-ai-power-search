import core from 'core';

import getToolStyles from 'helpers/getToolStyles';
import logger from 'helpers/logger';

import { getTextPosition } from 'features/EditorChatBot/utils/getTextPosition';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { LOGGER } from 'constants/lumin-common';
import { mapAnnotationToToolName } from 'constants/map';

import { hexToColor } from './hexToColor';

export async function addComments({
  text,
  page,
  color,
  comment,
}: {
  text: string;
  page: number;
  color: string;
  comment: string;
}) {
  try {
    const textTrimmed = text.trim();
    const textPosition = await getTextPosition(page, textTrimmed);
    const pageResult = textPosition.get(page);
    if (!pageResult) {
      return `Text not found on page ${page}.`;
    }
    const { position } = pageResult;
    const annotations: Core.Annotations.Annotation[] = [];

    position.forEach((quad) => {
      const highlightAnnot = new window.Core.Annotations.TextHighlightAnnotation({
        Quads: quad,
        PageNumber: page,
        Author: core.getCurrentUser(),
      });

      if (color) {
        highlightAnnot.StrokeColor = hexToColor(color);
      } else {
        const toolName = mapAnnotationToToolName(highlightAnnot) as string;
        if (toolName) {
          const { StrokeColor, Opacity } = getToolStyles(toolName) as {
            StrokeColor: Core.Annotations.Color;
            Opacity: number;
          };
          highlightAnnot.StrokeColor = StrokeColor;
          highlightAnnot.Opacity = Opacity;
        }
      }

      if (window.Core.Tools.TextAnnotationCreateTool.AUTO_SET_TEXT) {
        highlightAnnot.setContents(textTrimmed);
      }
      highlightAnnot.setCustomData(
        CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key,
        CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.truthyValue
      );
      highlightAnnot.setCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key, textTrimmed);
      const stickyAnnot = new window.Core.Annotations.StickyAnnotation({
        PageNumber: page,
        Author: core.getCurrentUser(),
      });

      stickyAnnot.setContents(comment);
      stickyAnnot.setCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key, textTrimmed);
      highlightAnnot.setCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key, stickyAnnot.Id);

      annotations.push(highlightAnnot);
      annotations.push(stickyAnnot);
    });

    core.addAnnotations(annotations);
    await core.getAnnotationManager().drawAnnotationsFromList(annotations);

    return `Comment has been added successfully.`;
  } catch (error) {
    logger.logError({
      error: error as Error,
      reason: LOGGER.Service.EDITOR_CHATBOT,
    });
    return `Failed to add comment. Please try again.`;
  }
}

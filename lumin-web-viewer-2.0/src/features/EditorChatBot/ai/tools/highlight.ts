/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

import core from 'core';

import { getTextPosition } from 'features/EditorChatBot/utils/getTextPosition';

import { CUSTOM_DATA_TEXT_TOOL } from 'constants/customDataConstant';

import { hexToColor } from './hexToColor';

/**
 * Highlights text in a document
 * @param data - Array of text items to highlight with page numbers and reference flag
 * @param color - Hex color to use for highlighting
 * @returns Summary message of highlighted text
 */
export async function highlightText(
  data: Array<{ text: string; page: number; isShowingReference: boolean }>,
  color: string
) {
  // Remove existing highlight references
  const highlightRefs = core
    .getAnnotationManager()
    .getAnnotationsList()
    .filter((annot) => !!annot.getCustomData('isHighlightRef'));
  if (highlightRefs.length > 0) {
    core.getAnnotationManager().deleteAnnotations(highlightRefs);
  }

  // Create a map to store text annotations grouped by page
  const highlightedTextByPage: Record<number, string[]> = {};
  for (const { text, page, isShowingReference } of data) {
    const textTrimmed = text.trim().replace(/\s+/g, ' ');
    const textPosition = await getTextPosition(page, textTrimmed);
    if (!textPosition.get(page)) {
      continue;
    }
    const { position } = textPosition.get(page);
    const annots = [];
    for (const quad of position) {
      const highlightAnnot = new window.Core.Annotations.TextHighlightAnnotation({
        Quads: quad,
        PageNumber: page,
        Author: core.getCurrentUser(),
      });
      if (color) {
        highlightAnnot.StrokeColor = hexToColor(color);
      }
      if (isShowingReference) {
        highlightAnnot.setCustomData('isHighlightRef', 'true');
      }
      if (window.Core.Tools.TextAnnotationCreateTool.AUTO_SET_TEXT) {
        highlightAnnot.setContents(textTrimmed);
      }
      highlightAnnot.setCustomData(CUSTOM_DATA_TEXT_TOOL.CONTENT.key, textTrimmed);
      annots.push(highlightAnnot);
    }
    core.addAnnotations(annots);
    await core.getAnnotationManager().drawAnnotationsFromList(annots);
    // Store the highlighted text grouped by page
    if (!highlightedTextByPage[page]) {
      highlightedTextByPage[page] = [];
    }
    highlightedTextByPage[page].push(textTrimmed);
  }

  // Build the response message with actual data
  let highlightSummary = `The requested text has been highlighted:`;

  // If no text was highlighted (all were not found)
  if (Object.keys(highlightedTextByPage).length === 0) {
    return `No matching text was found to highlight.`;
  }

  // Add each page's highlights to the response in ascending page order
  Object.entries(highlightedTextByPage)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0])) // Sort pages numerically
    .forEach(([pageNumber, highlightedTexts]) => {
      highlightSummary += `\n\nPage ${pageNumber}:`;
      highlightedTexts.forEach((highlightedText) => {
        highlightSummary += `\n- "${highlightedText}"`;
      });
    });

  highlightSummary += `\n\nLet me know if any changes are needed!`;
  return `Please response user with this message :"${highlightSummary}"`;
}

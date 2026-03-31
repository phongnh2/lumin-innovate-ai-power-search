/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unreachable-loop */
/* eslint-disable no-restricted-syntax */

import core from 'core';

import { getTextPosition } from 'features/EditorChatBot/utils/getTextPosition';

import { CUSTOM_DATA_TEXT_TOOL } from 'constants/customDataConstant';

import { hexToColor } from './hexToColor';

/**
 * Applies text decorations (underline, strike-through, highlight, squiggly)
 * @param type - The type of text decoration to apply
 * @param data - Array of text items to decorate with page numbers and reference flag
 * @param color - Hex color to use for decoration
 * @returns Summary message of decorated text
 */
export async function textDecoration(
  type: 'underline' | 'strike-through' | 'squiggly',
  data: Array<{ text: string; page: number; isShowingReference: boolean }>,
  color: string
) {
  const constructMap = {
    underline: window.Core.Annotations.TextUnderlineAnnotation,
    'strike-through': window.Core.Annotations.TextStrikeoutAnnotation,
    squiggly: window.Core.Annotations.TextSquigglyAnnotation,
  };
  // Create a map to store text annotations grouped by page
  const textDecorationsByPage: Record<number, string[]> = {};

  for (const { text, page } of data) {
    const textTrimmed = text.trim().replace(/\s+/g, ' ');
    const textPosition = await getTextPosition(page, textTrimmed);
    if (!textPosition.get(page)) {
      continue;
    }
    const { position } = textPosition.get(page);
    const AnnotationConstructor = constructMap[type];
    const annots = [];
    for (const quad of position) {
      const annotation = new AnnotationConstructor({
        Quads: quad,
        PageNumber: page,
        Author: core.getCurrentUser(),
      });
      if (color) {
        annotation.StrokeColor = hexToColor(color);
      }
      if (window.Core.Tools.TextAnnotationCreateTool.AUTO_SET_TEXT) {
        annotation.setContents(textTrimmed);
      }
      annotation.setCustomData(CUSTOM_DATA_TEXT_TOOL.CONTENT.key, textTrimmed);
      annots.push(annotation);
    }
    core.addAnnotations(annots);
    await core.getAnnotationManager().drawAnnotationsFromList(annots);
    // Store the decorated text grouped by page
    if (!textDecorationsByPage[page]) {
      textDecorationsByPage[page] = [];
    }
    textDecorationsByPage[page].push(textTrimmed);
  }
  // Build the response message with actual data
  let decorationSummary = `The requested text has been ${type}:`;

  // If no text was decorated (all were not found)
  if (Object.keys(textDecorationsByPage).length === 0) {
    return `No matching text was found to apply the ${type} decoration.`;
  }

  // Add each page's decorated text to the response in ascending page order
  Object.entries(textDecorationsByPage)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0])) // Sort pages numerically
    .forEach(([pageNumber, decoratedTexts]) => {
      decorationSummary += `\n\nPage ${pageNumber}:`;
      decoratedTexts.forEach((decoratedText) => {
        decorationSummary += `\n- "${decoratedText}"`;
      });
    });

  decorationSummary += `\n\nLet me know if any changes are needed!`;
  return `Please response user with this message :"${decorationSummary}"`;
}

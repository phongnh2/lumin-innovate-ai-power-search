/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-unreachable-loop */
/* eslint-disable no-restricted-syntax */
import core from 'core';

import { getTextPosition } from 'features/EditorChatBot/utils/getTextPosition';

import { TOOLS_NAME } from 'constants/toolsName';

/**
 * Creates a merged quad from a group of quads with the same y-coordinates
 * @param quads - Array of quads to merge
 * @returns A merged quad
 */
function createMergedQuad(quads: Core.Math.Quad[]): Core.Math.Quad {
  if (quads.length === 1) {
    return quads[0];
  }

  // Find leftmost and rightmost x-coordinates
  const leftQuad = quads[0]; // Already sorted by x1
  const rightQuad = quads[quads.length - 1];

  // Create a proper Quad object using the PDFTron API
  // This creates a new Quad with the necessary methods (like toRect)
  return new window.Core.Math.Quad(
    leftQuad.x1,
    leftQuad.y1, // Point 1 (top-left)
    rightQuad.x2,
    rightQuad.y2, // Point 2 (top-right)
    rightQuad.x3,
    rightQuad.y3, // Point 3 (bottom-right)
    leftQuad.x4,
    leftQuad.y4 // Point 4 (bottom-left)
  );
}

/**
 * Merges quads that have the same y-coordinates into a single quad
 * @param quads - Array of quads to merge
 * @returns Array of merged quads
 */
function mergeQuadsWithSameY(quads: Core.Math.Quad[]): Core.Math.Quad[] {
  if (!quads || quads.length <= 1) {
    return quads;
  }

  // Create a map to group quads by their y-coordinates
  const quadsByY = new Map<string, Core.Math.Quad[]>();

  quads.forEach((quad) => {
    // Create a key based on y-coordinates (rounded to handle floating point precision issues)
    const y1 = Math.round(quad.y1 * 1000) / 1000;
    const y2 = Math.round(quad.y2 * 1000) / 1000;
    const y3 = Math.round(quad.y3 * 1000) / 1000;
    const y4 = Math.round(quad.y4 * 1000) / 1000;
    const key = `${y1},${y2},${y3},${y4}`;

    if (!quadsByY.has(key)) {
      quadsByY.set(key, []);
    }
    quadsByY.get(key).push(quad);
  });

  // Merge quads with the same y-coordinates
  const mergedQuads: Core.Math.Quad[] = [];

  quadsByY.forEach((sameYQuads) => {
    // If there's only one quad with these y-coordinates, no merging needed
    if (sameYQuads.length === 1) {
      mergedQuads.push(sameYQuads[0]);
      return;
    }

    // Sort quads by x1 (left edge)
    sameYQuads.sort((a, b) => a.x1 - b.x1);

    const currentGroup = [sameYQuads[0]];

    for (let i = 1; i < sameYQuads.length; i++) {
      const currentQuad = sameYQuads[i];
      currentGroup.push(currentQuad);
    }

    // Don't forget to merge the last group
    if (currentGroup.length > 0) {
      const mergedQuad = createMergedQuad(currentGroup);
      mergedQuads.push(mergedQuad);
    }
  });

  return mergedQuads;
}

/**
 * Builds a response message for redacted text
 * @param redactedTextByPage - Record of redacted text grouped by page number
 * @returns Response message string
 */
function buildRedactionResponseMessage(redactedTextByPage: Record<number, string[]>): string {
  // If no text was redacted (all were not found)
  if (Object.keys(redactedTextByPage).length === 0) {
    return `Please response user with this message :"No matching text was found to redact."`;
  }

  // Build the response message with actual data
  let redactSummary = `I've marked the following text for redaction:`;

  // Add each page's redactions to the response in ascending page order
  Object.entries(redactedTextByPage)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0])) // Sort pages numerically
    .forEach(([pageNumber, redactedTexts]) => {
      redactSummary += `\n\nPage ${pageNumber}:`;
      redactedTexts.forEach((redactedText) => {
        redactSummary += `\n- ${redactedText}`;
      });
    });

  redactSummary += `\n\nClick **Apply redaction** button on the top right corner to confirm. Redaction is permanent.`;
  return `Please response user with this message :"${redactSummary}"`;
}

export async function redact(data: Array<{ text: string; page: number }>) {
  if (core.getToolMode().name !== TOOLS_NAME.REDACTION) {
    const tab = document.querySelector<HTMLElement>(`[data-element='securityTab']`);
    tab.click();
    core.setToolMode(TOOLS_NAME.REDACTION);
  }
  try {
    // Create a map to store redacted text annotations grouped by page
    const redactedTextByPage: Record<number, string[]> = {};

    for (const { text, page } of data) {
      const textTrimmed = text.trim().replace(/\s+/g, ' ');
      const quads = await getTextPosition(page, textTrimmed);

      if (!quads.get(page)) {
        continue;
      }

      const { position } = quads.get(page);
      // Merge quads with the same y-coordinates
      const mergedQuads = mergeQuadsWithSameY(position.flat());

      const redactAnnot = new window.Core.Annotations.RedactionAnnotation({
        Quads: mergedQuads,
        PageNumber: page,
      });
      core.addAnnotations([redactAnnot]);
      await core.getAnnotationManager().drawAnnotationsFromList([redactAnnot]);

      // Store the redacted text grouped by page
      if (!redactedTextByPage[page]) {
        redactedTextByPage[page] = [];
      }
      redactedTextByPage[page].push(text.trim());
    }

    return buildRedactionResponseMessage(redactedTextByPage);
  } catch (err) {
    return 'Redact failed';
  }
}

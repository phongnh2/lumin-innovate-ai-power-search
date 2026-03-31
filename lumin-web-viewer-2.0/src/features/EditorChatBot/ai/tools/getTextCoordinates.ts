import core from 'core';

export async function getTextCoordinates(page: number, text: string) {
  const pageText = await core.getDocument().loadPageText(page);
  const startTextPosition = pageText.indexOf(text);
  if (startTextPosition === -1) {
    throw new Error(`Text '${text}' not found on page ${page}`);
  }
  const endTextPosition = startTextPosition + text.length;
  const quads = (await core.getTextPosition(page, startTextPosition, endTextPosition)) as Core.Math.Quad[];
  return `The coordinate of the text '${text}' on page ${page} is: x1: ${quads[0].x1}, y1: ${quads[0].y1}, x2: ${
    quads[quads.length - 1].x4
  }, y2: ${quads[quads.length - 1].y4}`;
}

/* eslint-disable no-await-in-loop */
import core from 'core';

function isTextInvisible(textRenderMode: number, fillOpacity: number): boolean {
  return textRenderMode === window.Core.PDFNet.GState.TextRenderingMode.e_invisible_text || fillOpacity === 0;
}

function isTextNormal(textRenderMode: number, fillOpacity: number): boolean {
  return textRenderMode === window.Core.PDFNet.GState.TextRenderingMode.e_fill_text && fillOpacity === 1;
}

function processTextElement(
  textRenderMode: number,
  fillOpacity: number
): { invisibleText: boolean; normalText: boolean } {
  return {
    invisibleText: isTextInvisible(textRenderMode, fillOpacity),
    normalText: isTextNormal(textRenderMode, fillOpacity),
  };
}

async function processFormElement(
  element: Core.PDFNet.Element,
  reader: Core.PDFNet.ElementReader,
  visited: number[]
): Promise<{ invisibleText: boolean; normalText: boolean }> {
  const formObject = await element.getXObject();
  const formObjectNumber = await formObject.getObjNum();
  if (visited.includes(formObjectNumber)) {
    return { invisibleText: false, normalText: false };
  }
  visited.push(formObjectNumber);
  await reader.formBegin();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const result = await hasInvisibleText(reader, visited);
  await reader.end();
  return result;
}

async function hasInvisibleText(
  reader: Core.PDFNet.ElementReader,
  visited: number[]
): Promise<{ invisibleText: boolean; normalText: boolean }> {
  let invisibleText = false;
  let normalText = false;
  for (let element = await reader.next(); element !== null; element = await reader.next()) {
    const elementType = await element.getType();
    const elementGState = await element.getGState();
    const textRenderMode = await elementGState.getTextRenderMode();
    const fillOpacity = await elementGState.getFillOpacity();
    switch (elementType) {
      case window.Core.PDFNet.Element.Type.e_text: {
        const textResult = processTextElement(textRenderMode, fillOpacity);
        invisibleText = invisibleText || textResult.invisibleText;
        normalText = normalText || textResult.normalText;
        break;
      }
      case window.Core.PDFNet.Element.Type.e_form: {
        if (invisibleText) {
          return {
            invisibleText: true,
            normalText,
          };
        }
        const formResult = await processFormElement(element, reader, visited);
        invisibleText = invisibleText || formResult.invisibleText;
        normalText = normalText || formResult.normalText;
        break;
      }
      default: {
        break;
      }
    }
  }
  return {
    invisibleText,
    normalText,
  };
}

export async function isDocumentFullOCRed() {
  const doc = await core.getDocument().getPDFDoc();
  const pageIterator = await doc.getPageIterator();
  const reader = await window.Core.PDFNet.ElementReader.create();
  const visited: number[] = [];
  let normalText = false;
  let invisibleText = false;

  for (pageIterator; await pageIterator.hasNext(); pageIterator.next()) {
    const page = await pageIterator.current();
    const sdfObj = await page.getSDFObj();
    const insertedObj = await sdfObj.getObjNum();
    if (!visited.includes(insertedObj)) {
      visited.push(insertedObj);
    }
    await reader.beginOnPage(page);
    const { invisibleText: i, normalText: n } = await hasInvisibleText(reader, visited);
    if (!invisibleText) {
      invisibleText = i;
    }
    if (!normalText) {
      normalText = n;
    }
    await reader.end();
  }
  return !normalText && invisibleText;
}

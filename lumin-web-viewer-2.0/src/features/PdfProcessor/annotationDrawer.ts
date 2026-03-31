/* eslint-disable class-methods-use-this */
import pLimit from 'p-limit';

import fileUtil from 'utils/file';

import { images } from 'constants/documentType';

import { IFormField } from 'interfaces/document/document.interface';

import { AnnotationCommandBase } from './annotationCommand/base';
import { AnnotationCommandFactory } from './annotationCommand/factory';
import { FormFieldDrawer } from './formFieldDrawer';

type AnnotationDataType = {
  annotationId: string;
  xfdf: string;
};

const limitPromise = pLimit(5);

export class AnnotationDrawer {
  private _doc: Core.PDFNet.PDFDoc;

  private _signedUrlMap: Record<string, string>;

  constructor(doc: Core.PDFNet.PDFDoc, signedUrlMap: Record<string, string>) {
    this._doc = doc;
    this._signedUrlMap = signedUrlMap || {};
  }

  async drawAnnotation(annotations: AnnotationDataType[], fields: IFormField[]) {
    const fdfDoc = await this._doc.fdfExtract(window.Core.PDFNet.PDFDoc.ExtractFlag.e_both);
    const xfdf = await fdfDoc.saveAsXFDFAsString();
    const parser = new DOMParser();
    const rootDocument = parser.parseFromString(xfdf, 'text/xml');
    const parentAnnots = this.getAnnotsElement(rootDocument);
    const listAnnotationCommands = annotations.reduce((prevValue, { xfdf: commandXfdf }) => {
      const commands = AnnotationCommandFactory.getCommands(commandXfdf);
      return [...prevValue, ...commands];
    }, [] as AnnotationCommandBase[]);
    listAnnotationCommands.forEach((command) => command.execute(parentAnnots));
    await this.transformSignedUrlIntoBase64(parentAnnots);
    this.drawFormField(fields, parser, rootDocument);
    const serializer = new XMLSerializer();
    const xfdfString = serializer.serializeToString(rootDocument);
    const transformedFdfDoc = await window.Core.PDFNet.FDFDoc.createFromXFDF(xfdfString);
    await this._doc.fdfUpdate(transformedFdfDoc);
    const refreshAnnotOptions = new window.Core.PDFNet.PDFDoc.RefreshOptions();
    refreshAnnotOptions.setUseNonStandardRotation(true);
    await this._doc.refreshAnnotAppearances(refreshAnnotOptions);
  }

  private drawFormField(fields: IFormField[], parser: DOMParser, rootDocument: Document) {
    const formFieldDrawer = new FormFieldDrawer(parser, rootDocument);
    formFieldDrawer.drawFields(fields);
  }

  private getAnnotsElement(rootDocument: Document): Element {
    let parentAnnots = rootDocument.querySelector('annots');
    const xfdfElement = rootDocument.querySelector('xfdf');
    if (!parentAnnots) {
      parentAnnots = rootDocument.createElement('annots');
      parentAnnots.removeAttribute('xmlns');
      xfdfElement.appendChild(parentAnnots);
    }
    return parentAnnots;
  }

  private async transformSignedUrlIntoBase64(element: Element): Promise<void> {
    const stampElements = element.querySelectorAll('stamp');
    await Promise.all(
      Array.from(stampElements).map((stampElement) =>
        limitPromise(async () => {
          const customDataElement = stampElement.querySelector('trn-custom-data');
          if (!customDataElement) {
            return;
          }

          const customData = JSON.parse(customDataElement.getAttribute('bytes')) as Record<string, string>;
          if (!customData.remoteId) {
            return;
          }
          const signedUrl = this._signedUrlMap[customData.remoteId];
          if (!signedUrl) {
            return;
          }
          const base64Data = await this.getBase64Image(signedUrl);
          const imageDataElement = stampElement.querySelector('imagedata');
          imageDataElement.innerHTML = base64Data;
        })
      )
    );
  }

  private async getBase64Image(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const mimeType = fileUtil.getMimeTypeFromSignedUrl(imageUrl);
        const base64Data = canvas.toDataURL(mimeType === images.JPEG ? mimeType : images.PNG);
        resolve(base64Data);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }
}

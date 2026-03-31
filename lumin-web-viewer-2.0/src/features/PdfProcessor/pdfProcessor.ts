import { OutlineCoreUtils } from 'features/Outline/utils/outlineCore.utils';
import { OutlineTransformerUtils } from 'features/Outline/utils/outlineTransformer.utils';

import { IAnnotation, IDocumentBase, IFormField, TDocumentOutline } from 'interfaces/document/document.interface';

import { AnnotationDrawer } from './annotationDrawer';
import ManipulationDrawer from './manipulationDrawer';

export class PdfProcessor {
  constructor(
    private readonly document: IDocumentBase,
    private readonly annotations: IAnnotation[],
    private readonly fields: IFormField[],
    private readonly arrOutline: TDocumentOutline[],
    private readonly signedUrls: Record<string, string>,
    private readonly buffer: ArrayBuffer
  ) {}

  async process() {
    const pdfDoc = await window.Core.PDFNet.PDFDoc.createFromBuffer(this.buffer);

    await this.applyManipulations(pdfDoc);
    await this.applyOutlines(pdfDoc);
    await this.applyAnnotations(pdfDoc);

    return pdfDoc;
  }

  private async applyManipulations(pdfDoc: Core.PDFNet.PDFDoc) {
    const manipulationDrawer = new ManipulationDrawer(pdfDoc);
    if (this.document.manipulationStep) {
      await manipulationDrawer.draw(JSON.parse(this.document.manipulationStep));
    }
  }

  private async applyOutlines(pdfDoc: Core.PDFNet.PDFDoc) {
    const outlines = OutlineTransformerUtils.convertToNestedOutline(this.arrOutline);
    await OutlineCoreUtils.convertOutline({
      pdfDoc,
      outlines: outlines.children,
      parentOutline: null,
    });
  }

  private async applyAnnotations(pdfDoc: Core.PDFNet.PDFDoc) {
    const annotationDrawer = new AnnotationDrawer(pdfDoc, this.signedUrls);
    await annotationDrawer.drawAnnotation(this.annotations, this.fields);
  }
}

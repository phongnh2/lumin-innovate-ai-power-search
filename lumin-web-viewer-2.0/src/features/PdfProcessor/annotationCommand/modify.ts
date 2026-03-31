import { AnnotationCommandBase } from "./base";

export class ModifyAnnotationCommand extends AnnotationCommandBase {

  xfdf: string;

  constructor(annotationId: string, xfdf: string) {
    super(annotationId);
    this.xfdf = xfdf;
  }

  execute(annotsElement: Element) {
    const annot = annotsElement.querySelector(`[name="${this.annotationId}"]`);
    if (annot) {
      annot.outerHTML = this.xfdf;
    } else {
      const parser = new DOMParser();
      const annotationElement = parser.parseFromString(this.xfdf, 'text/xml').documentElement;
      annotsElement.appendChild(annotationElement);
    }
  }
}
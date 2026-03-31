import { AnnotationCommandBase } from "./base";

export class AddAnnotationCommand extends AnnotationCommandBase {

  xfdf: string;

  constructor(annotationId: string, xfdf: string) {
    super(annotationId);
    this.xfdf = xfdf;
  }

  execute(annotsElement: Element) {
    const parser = new DOMParser();
    const annotationElement = parser.parseFromString(this.xfdf, 'text/xml').documentElement;
    annotsElement.appendChild(annotationElement);
  }
}
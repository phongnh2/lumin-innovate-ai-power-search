import { AnnotationCommandBase } from "./base";

export class DeleteAnnotationCommand extends AnnotationCommandBase {

  execute(annotsElement: Element) {
    const annot = annotsElement.querySelector(`[name="${this.annotationId}"]`);
    if (annot) {
      annotsElement.removeChild(annot);
    }
  }
}
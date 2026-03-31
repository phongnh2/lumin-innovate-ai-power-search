import { AddAnnotationCommand } from './add';
import { AnnotationCommandBase } from './base';
import { DeleteAnnotationCommand } from './delete';
import { ModifyAnnotationCommand } from './modify';

export class AnnotationCommandFactory {
  private static extractDeleteAnnotationId(element: Element): string {
    // Extract annotation id from name attribute,
    // or fall back to textContent for elements with format: <id page="{pageNumber}">{annotationId}</id>
    return element.getAttribute('name') ? element.getAttribute('name') : element.textContent;
  }

  static getCommands(xfdf: string): AnnotationCommandBase[] {
    const parser = new DOMParser();
    const annotationCommandElement = parser.parseFromString(xfdf, 'text/xml');
    const addElement = annotationCommandElement.querySelector('add');
    const modifyElement = annotationCommandElement.querySelector('modify');
    const deleteElement = annotationCommandElement.querySelector('delete');
    const commands: Array<AnnotationCommandBase> = [];
    if (addElement.childElementCount) {
      Array.from(addElement.children).forEach((element) => {
        commands.push(new AddAnnotationCommand(element.getAttribute('name'), element.outerHTML));
      });
    }
    if (modifyElement.childElementCount) {
      Array.from(modifyElement.children).forEach((element) => {
        commands.push(new ModifyAnnotationCommand(element.getAttribute('name'), element.outerHTML));
      });
    }
    if (deleteElement.childElementCount) {
      Array.from(deleteElement.children).forEach((element) => {
        const annotId = this.extractDeleteAnnotationId(element);
        if (!annotId) {
          return;
        }

        commands.push(new DeleteAnnotationCommand(annotId));
      });
    }
    return commands;
  }
}

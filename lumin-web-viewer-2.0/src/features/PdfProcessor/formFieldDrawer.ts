import stringUtils from "utils/string";

import { IFormField } from "interfaces/document/document.interface";

export class FormFieldDrawer {
  private parser: DOMParser;

  private rootDocument: Document;

  private pdfInfoElement: Element;

  private xfdfElement: Element;

  constructor(parser: DOMParser, rootDocument: Document) {
    this.parser = parser;
    this.rootDocument = rootDocument;
    this.pdfInfoElement = rootDocument.querySelector('pdf-info');
    this.xfdfElement = rootDocument.querySelector('xfdf');
  }

  public drawFields(fields: IFormField[]) {
    fields.forEach((field) => this.processField(field));
  }

  private processField(field: IFormField) {
    const { name, value, xfdf, isDeleted } = field;

    if (isDeleted) {
      this.removeExistingField(name);
      return;
    }

    if (xfdf) {
      this.updateOrCreateField(name, xfdf);
    }

    this.updateFieldValue(name, value);
  }

  private removeExistingField(name: string) {
    const fieldElement = this.pdfInfoElement.querySelector(`& > ffield[name="${stringUtils.escapeSelector(name)}"]`);
    if (fieldElement) {
      this.pdfInfoElement.removeChild(fieldElement);
    }
    const widgets = this.pdfInfoElement.querySelectorAll(`& > widget[field="${stringUtils.escapeSelector(name)}"]`);
    widgets.forEach((widget) => {
      this.pdfInfoElement.removeChild(widget);
    });
  }

  private updateOrCreateField(name: string, xfdf: string) {
    const xmlData = this.parser.parseFromString(xfdf, 'text/xml');
    const updatedFormField = xmlData.querySelector('ffield');
    if (updatedFormField) {
      const formFieldElement = this.pdfInfoElement.querySelector(
        `& > ffield[name="${stringUtils.escapeSelector(name)}"]`
      );
      if (formFieldElement) {
        formFieldElement.outerHTML = updatedFormField.outerHTML;
      } else {
        this.pdfInfoElement.appendChild(updatedFormField);
      }
    }
    const updatedWidgets = xmlData.querySelectorAll('widget');
    const widgetElements = this.pdfInfoElement.querySelectorAll(
      `& > widget[field="${stringUtils.escapeSelector(name)}"]`
    );
    widgetElements.forEach((widgetElement) => {
      this.pdfInfoElement.removeChild(widgetElement);
    });
    updatedWidgets.forEach((widget) => {
      this.pdfInfoElement.appendChild(widget);
    });
  }

  private updateFieldValue(name: string, value: string) {
    let parentFields = this.rootDocument.querySelector('fields');
    if (!parentFields) {
      parentFields = this.rootDocument.createElement('fields');
      parentFields.removeAttribute('xmlns');
      this.xfdfElement.appendChild(parentFields);
    }
    const fieldValueElement = name.split('.').reduce((currentNode, key) => {
      const node = currentNode.querySelector(`field[name="${stringUtils.escapeSelector(key)}"]`);
      if (node) {
        return node;
      }
      const newNode = this.rootDocument.createElement('field');
      newNode.setAttribute('name', key);
      newNode.removeAttribute('xmlns');
      currentNode.appendChild(newNode);
      return newNode;
    }, parentFields);
    if (fieldValueElement) {
      let valueElement = fieldValueElement.querySelector('value');
      if (!valueElement) {
        valueElement = this.rootDocument.createElementNS('', 'value');
        fieldValueElement.appendChild(valueElement);
      }
      valueElement.textContent = value;
    }
  }
}
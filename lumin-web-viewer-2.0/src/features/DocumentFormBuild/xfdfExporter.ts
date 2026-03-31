/* eslint-disable class-methods-use-this */
import core from 'core';

import exportAnnotations from 'helpers/exportAnnotations';

import stringUtils from 'utils/string';

import { ExportWidgetDataType } from './type';

type TransformDataResult = {
  name: string;
  ffield: string;
  annots: string[];
  widgetId: string;
  pageNumber: number;
};

export class XfdfExporter {
  private static instance: XfdfExporter;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): XfdfExporter {
    if (!XfdfExporter.instance) {
      XfdfExporter.instance = new XfdfExporter();
    }
    return XfdfExporter.instance;
  }

  private internalFields: string[];

  setInternalFields(fields: string[]): void {
    this.internalFields = fields;
  }

  isInternalField(name: string): boolean {
    return this.internalFields.includes(name);
  }

  async export(fields: string[]): Promise<ExportWidgetDataType[]> {
    const fieldManager = core.getAnnotationManager().getFieldManager();

    const annotList = core
      .getAnnotationsList()
      .filter((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation);

    const xfdf = await exportAnnotations({
      annotList,
      widgets: true,
      links: false,
      fields: true,
    });

    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    const xfdfElements = parser.parseFromString(xfdf, 'text/xml');
    const pdfInfoElement = xfdfElements.querySelector('pdf-info');
    const listData = this.transformData(fields, pdfInfoElement, serializer);
    pdfInfoElement.innerHTML = '$lumin_form_field';
    this.removeRedundantData(xfdfElements);

    const xfdfString = serializer.serializeToString(xfdfElements);
    return listData.map(({ ffield, widgetId, pageNumber, name, annots }) => {
      const fieldXfdf = xfdfString.replace('$lumin_form_field', [ffield, ...annots].join('\n'));
      const { value, type } = fieldManager.getField(name) as Core.Annotations.Forms.Field;
      return {
        name,
        xfdf: fieldXfdf,
        value: value as string,
        type,
        isInternal: this.internalFields.includes(name),
        isDeleted: false,
        widgetId,
        pageNumber,
      };
    });
  }

  private transformData(
    fields: string[],
    pdfInfoElement: Element,
    serializer: XMLSerializer
  ): Array<TransformDataResult> {
    const listData: Array<TransformDataResult> = [];
    fields.forEach((name) => {
      const ffield = pdfInfoElement.querySelector(`ffield[name='${stringUtils.escapeSelector(name)}']`);
      const widgets = pdfInfoElement.querySelectorAll(`widget[field='${stringUtils.escapeSelector(name)}']`);
      if (!ffield || !widgets?.length) {
        return;
      }
      listData.push({
        name,
        ffield: serializer.serializeToString(ffield).normalize(),
        annots: Array.from(widgets).map((widget) => serializer.serializeToString(widget).normalize()),
        widgetId: widgets[0].getAttribute('name'),
        pageNumber: Number.parseInt(widgets[0].getAttribute('page')),
      });
    });
    return listData;
  }

  private removeRedundantData(xfdfElements: Document): void {
    const annotsElement = xfdfElements.querySelector('annots');

    if (annotsElement) {
      annotsElement.remove();
    }

    const fieldsElement = xfdfElements.querySelector('fields');

    if (fieldsElement) {
      fieldsElement.remove();
    }
  }

  exportDeletedFields(
    fields: Array<{
      fieldName: string;
      widgetId: string;
      pageNumber: number;
    }>
  ): ExportWidgetDataType[] {
    return fields.map(({ fieldName, widgetId, pageNumber }) => ({
      name: fieldName,
      isInternal: this.internalFields.includes(fieldName),
      isDeleted: true,
      widgetId,
      pageNumber,
    }));
  }
}

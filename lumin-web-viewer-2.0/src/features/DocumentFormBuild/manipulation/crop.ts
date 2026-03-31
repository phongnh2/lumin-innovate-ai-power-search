import { Action } from './base';
import { ExportWidgetDataType } from '../type';

export class CropPageAction extends Action {
  // eslint-disable-next-line class-methods-use-this
  protected getPageNeedSave(): number[] {
    return [];
  }

  constructor(private deletedWidgets: Core.Annotations.WidgetAnnotation[]) {
    super();
  }

  public async exportData(): Promise<ExportWidgetDataType[]> {
    const modifiedFields = new Set<string>();
    const deletedFields: Record<string, { fieldName: string; widgetId: string; pageNumber: number }> = {};

    this.deletedWidgets.forEach((widget) => {
      const field = widget.getField();
      const hasOtherFormField = field.widgets?.some(({ Id }) => Id !== widget.Id);
      if (hasOtherFormField) {
        modifiedFields.add(widget.fieldName);
      } else if (!deletedFields[widget.fieldName]) {
        deletedFields[widget.fieldName] = {
          fieldName: widget.fieldName,
          widgetId: widget.Id,
          pageNumber: widget.PageNumber,
        };
      }
    });

    const modifiedResult = await this.xfdfExporter.export([...modifiedFields]);
    const listDeletedFields = this.xfdfExporter.exportDeletedFields(Object.values(deletedFields));

    return [...modifiedResult, ...listDeletedFields];
  }
}
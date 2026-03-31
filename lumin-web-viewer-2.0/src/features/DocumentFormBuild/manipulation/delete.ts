import { Action, sortFn } from './base';
import { ExportWidgetDataType } from '../type';

export class DeletePageAction extends Action {
  private modifiedFields: Set<string>;

  constructor(private deletePages: number[], private deletedWidgets: Core.Annotations.WidgetAnnotation[]) {
    super();
  }

  getPageNeedSave(): number[] {
    const result: number[] = [];
    this.deletePages.sort(sortFn);
    const firstPageIndex = this.deletePages[0];
    for (let i = firstPageIndex; i <= this.totalPages; i++) {
      if (!this.deletePages.includes(i)) {
        const numberToDecrease = this.deletePages.filter((page) => i >= page).length;
        result.push(i - numberToDecrease);
      }
    }
    return result;
  }

  getModifiedFieldList(): string[] {
    const fieldsList = super.getModifiedFieldList();
    return [...fieldsList, ...Array.from(this.modifiedFields)];
  }

  async exportData(): Promise<ExportWidgetDataType[]> {
    this.modifiedFields = new Set<string>();
    const deletedFields: Record<string, { fieldName: string; widgetId: string; pageNumber: number }> = {};

    this.deletedWidgets.forEach((widget) => {
      const field = widget.getField();
      const hasOtherFormField = field.widgets?.some(({ Id }) => Id !== widget.Id);
      if (hasOtherFormField) {
        this.modifiedFields.add(widget.fieldName);
      } else if (!deletedFields[widget.fieldName]) {
        deletedFields[widget.fieldName] = {
          fieldName: widget.fieldName,
          widgetId: widget.Id,
          pageNumber: widget.PageNumber,
        };
      }
    });

    const result = await super.exportData();
    const listDeletedFields = this.xfdfExporter.exportDeletedFields(Object.values(deletedFields));
    return [...result, ...listDeletedFields];
  }
}
import core from 'core';

import { commandHandler } from 'HOC/OfflineStorageHOC';

import { documentServices } from 'services';

import { socket } from '../../../socket';
import { FormFieldChangedSource } from '../constants';
import { ExportWidgetDataType } from '../type';
import { XfdfExporter } from '../xfdfExporter';

export abstract class Action {
  protected totalPages: number;

  protected xfdfExporter: XfdfExporter;

  constructor() {
    this.xfdfExporter = XfdfExporter.getInstance();
    this.totalPages = core.getTotalPages();
  }

  protected abstract getPageNeedSave(): number[];

  public exportData(): Promise<ExportWidgetDataType[]> {
    const fieldsList = this.getModifiedFieldList();

    return this.xfdfExporter.export(fieldsList);
  }

  public async updateFormFieldChanged(documentId: string): Promise<void> {
    const listFields = await this.exportData();
    listFields.forEach((data) => {
      if (documentServices.isOfflineMode()) {
        commandHandler.insertField(documentId, data);
      } else {
        commandHandler.insertTempAction(documentId, [{
          type: 'field',
          data,
        }]);
        socket.emit('formFieldChanged', {
          data,
          roomId:documentId,
          fieldName: data.name,
          formFieldChangedSource: FormFieldChangedSource.MANIPULATION,
        });

      }
    });
  }

  protected getModifiedFieldList(): string[] {
    const listPageNeedSave = this.getPageNeedSave();
    const uniqueFields= new Set<string>();
    core.getAnnotationsList().forEach((annot) => {
      if (listPageNeedSave.includes(annot.PageNumber) && annot instanceof window.Core.Annotations.WidgetAnnotation) {
        uniqueFields.add(annot.fieldName);
      }
    });
    return Array.from(uniqueFields);
  }

}
export function sortFn(a: number, b: number): number {
  return a - b;
}
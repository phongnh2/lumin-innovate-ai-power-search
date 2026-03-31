import pLimit from 'p-limit';

import core from 'core';

import { commandHandler } from 'HOC/OfflineStorageHOC';

import { documentServices } from 'services';

import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { XfdfExporter } from './xfdfExporter';
import { socket } from '../../socket';

type CurrentFieldData = {
  name: string;
  isDeleted: boolean;
  isModified: boolean;
  isAdded: boolean;
  widgetId: string;
  pageNumber: number;
};

const limitFn = pLimit(1);

export class FormBuilder {
  private xfdfExporter: XfdfExporter;

  private currentFields: Record<string, CurrentFieldData>;

  private deletedSignatures: Core.Annotations.Annotation[] = [];

  constructor() {
    this.xfdfExporter = XfdfExporter.getInstance();
    this.reset();
  }

  setCurrentFields(fields: Core.Annotations.Forms.Field[]): void {
    this.currentFields = fields.reduce((prevValue, field) => {
      prevValue[field.name] = {
        name: field.name,
        isDeleted: false,
        isModified: false,
        isAdded: false,
        widgetId: field.widgets[0]?.Id,
        pageNumber: field.widgets[0]?.PageNumber,
      };
      return prevValue;
    }, {} as Record<string, CurrentFieldData>);
  }

  reset(): void {
    this.currentFields = {};
    this.deletedSignatures = [];
  }

  rename(oldFieldName: string, newFieldName: string): void {
    if (oldFieldName === newFieldName) {
      return;
    }
    limitFn(() => {
      const oldFieldNameRemainWidgets = core
        .getAnnotationsList()
        .some(
          (annot) => annot instanceof window.Core.Annotations.WidgetAnnotation && annot.fieldName === oldFieldName
        );

      const oldField = this.currentFields[oldFieldName];

      if (oldField?.isAdded) {
        const data = { ...oldField, name: newFieldName };
        if (!oldFieldNameRemainWidgets) {
          delete this.currentFields[oldFieldName];
        }
        this.currentFields[newFieldName] = data;
        return;
      }
      this.renameExistedFormField({ oldFieldName, oldFieldNameRemainWidgets, newFieldName });
    }).catch(() => {});
  }

  hasAddedNewField(): boolean {
    return Object.values(this.currentFields).some((field) => field.isAdded);
  }

  private renameExistedFormField(data: {
    oldFieldName: string;
    oldFieldNameRemainWidgets: boolean;
    newFieldName: string;
  }) {
    const { oldFieldName, oldFieldNameRemainWidgets, newFieldName } = data;
    Object.entries(this.currentFields).forEach(([_, field]) => {
      if (field.name !== oldFieldName) {
        return;
      }
      if (this.xfdfExporter.isInternalField(oldFieldName)) {
        if (!oldFieldNameRemainWidgets) {
          this.delete(oldFieldName);
        } else {
          this.modify(oldFieldName);
        }
        this.add({ fieldName: newFieldName, widgetId: field.widgetId, pageNumber: field.pageNumber });
      } else {
        this.currentFields[oldFieldName].isModified = true;
        if (oldFieldNameRemainWidgets) {
          this.add({ fieldName: newFieldName, widgetId: field.widgetId, pageNumber: field.pageNumber });
        } else {
          this.currentFields[oldFieldName].name = newFieldName;
        }
      }
    });
  }

  add(params: { fieldName: string; widgetId: string; pageNumber: number }): void {
    this.currentFields[params.fieldName] = {
      name: params.fieldName,
      isAdded: true,
      isDeleted: false,
      isModified: false,
      widgetId: params.widgetId,
      pageNumber: params.pageNumber,
    };
  }

  modify(fieldName: string): void {
    const item = Object.entries(this.currentFields).find(
      ([key, field]) => field.name === fieldName || key === fieldName
    );
    if (!item) {
      return;
    }
    const [, field] = item;
    if (field.isDeleted) {
      return;
    }
    field.isModified = true;
  }

  delete(fieldName: string): void {
    const item = Object.entries(this.currentFields).find(
      ([key, field]) => field.name === fieldName || key === fieldName
    );

    if (!item) {
      return;
    }
    const [key, field] = item;

    if (field.isAdded) {
      delete this.currentFields[key];
      return;
    }
    field.isDeleted = true;
  }

  handleAnnotationChange({
    annotations,
    action,
  }: {
    annotations: Core.Annotations.Annotation[];
    action: string;
  }): void {
    annotations.filter((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation).forEach((annot) => {
      switch (action) {
        case ANNOTATION_ACTION.ADD: {
          this.add({ fieldName: annot.fieldName, pageNumber: annot.PageNumber, widgetId: annot.Id });
          break;
        }
        case ANNOTATION_ACTION.MODIFY: {
          this.modify(annot.fieldName);
          break;
        }
        case ANNOTATION_ACTION.DELETE: {
          const hasOtherFormField = core
            .getAnnotationsList()
            .some((widget) => widget instanceof window.Core.Annotations.WidgetAnnotation && widget.fieldName === annot.fieldName && widget.Id !== annot.Id);

          if (hasOtherFormField) {
            let field = core.getFieldsList().find(({ name }) => name === annot.fieldName);
            if (!field) {
              field = (
                core
                  .getAnnotationsList()
                  .find(
                    (annotation) => (annotation as Core.Annotations.WidgetAnnotation).fieldName === annot.fieldName
                  ) as Core.Annotations.WidgetAnnotation
              ).getField();
              core.getAnnotationManager().getFieldManager().addField(field);
            }
            this.modify(annot.fieldName);
          } else {
            this.delete(annot.fieldName);
          }
          break;
        }
        default:
          break;
      }
    });
  }

  pushDeletedSignature(annot: Core.Annotations.Annotation): void {
    this.deletedSignatures.push(annot);
  }

  publishDeletedSignatures(): void {
    if (this.deletedSignatures.length) {
      core.getAnnotationManager().trigger('annotationChanged', [this.deletedSignatures, 'delete', {}]);
    }
  }

  async exportWidgetXfdf(documentId: string): Promise<void> {
    const deletedFields: Array<{ fieldName: string; widgetId: string; pageNumber: number }> = [];
    const exportXfdfMap: Record<string, string> = {};
    Object.entries(this.currentFields).forEach(
      ([fieldName, { name, isDeleted, isAdded, isModified, widgetId, pageNumber }]) => {
        if (isDeleted) {
          deletedFields.push({ fieldName, widgetId, pageNumber });
          return;
        }
        if (isAdded || isModified) {
          exportXfdfMap[name] = fieldName;
        }
      }
    );
    const listXfdf = await this.xfdfExporter.export(Object.keys(exportXfdfMap));
    listXfdf.forEach((data) => {
      const fieldNeedUpdate = exportXfdfMap[data.name];
      if (documentServices.isOfflineMode()) {
        commandHandler.insertField(documentId, data) as unknown;
      } else {
        commandHandler.insertTempAction(documentId, [
          {
            type: 'field',
            data,
          },
        ]);
        socket.emit(SOCKET_EMIT.FORM_FIELD_CHANGE, {
          fieldName: fieldNeedUpdate,
          data,
          roomId: documentId,
        });
      }
    });
    const listDeletedFields = this.xfdfExporter.exportDeletedFields(deletedFields);
    listDeletedFields.forEach((data) => {
      socket.emit(SOCKET_EMIT.FORM_FIELD_CHANGE, {
        fieldName: data.name,
        data,
        roomId: documentId,
      });
    });
    if (listXfdf.length || listDeletedFields.length) {
      core.getAnnotationManager().trigger('formBuilderChanged');
    }
    this.reset();
  }
}
export const formBuilder = new FormBuilder();

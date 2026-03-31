export interface BaseExportWidgetDataType {
  name: string;
  isDeleted: boolean;
  isInternal: boolean;
  type?: string;
}

export interface ExportWidgetDataType extends BaseExportWidgetDataType {
  xfdf?: string;
  value?: string;
};

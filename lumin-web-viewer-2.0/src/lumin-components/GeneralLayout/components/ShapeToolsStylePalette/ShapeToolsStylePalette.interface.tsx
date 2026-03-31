import { ToolName } from 'core/type';

import { IAnnotationStyle } from 'interfaces/viewer/viewer.interface';

interface IOnToolClickInterface {
  dataElement: string;
  toolName: string;
}

export interface IToolShapeAndTextObject {
  dataElement: string,
  icon: string,
  showColor: string,
  title: string
}

export interface IShapeToolsStylePaletteProps {
  style: IAnnotationStyle;
  onChange: (property: string, value: object | string | number) => void;
  tools?: string[];
  onToolClick: (arg: IOnToolClickInterface) => void;
  forTool: ToolName;
  toolObjects?: {
    [key: string]: IToolShapeAndTextObject
  };
}

export interface IDataWithKey {
  availablePalettes: string[];
}

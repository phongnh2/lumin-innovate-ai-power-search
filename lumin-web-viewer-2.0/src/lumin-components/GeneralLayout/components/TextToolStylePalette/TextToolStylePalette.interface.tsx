import { IAnnotationStyle } from 'interfaces/viewer/viewer.interface';

import { IToolShapeAndTextObject } from '../ShapeToolsStylePalette/ShapeToolsStylePalette.interface';

interface IOnToolClickInterface {
  dataElement: string;
  toolName: string;
}

export interface ITextToolPaletteProps {
  style?: IAnnotationStyle;
  onChange?: (property: string, value: object | string | number) => void;
  tools?: string[];
  onToolClick?: (arg: IOnToolClickInterface) => void;
  toolObjects?: {
    [key: string]: IToolShapeAndTextObject
  };
}

import { IAnnotationStyle } from 'interfaces/viewer/viewer.interface';

export interface IStrokeStylePaletteProps {
  style?: IAnnotationStyle;
  onChange?: (property: string, value: object | string | number) => void;
}

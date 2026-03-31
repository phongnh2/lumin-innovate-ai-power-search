import { IAnnotationStyle } from 'interfaces/viewer/viewer.interface';

export interface IStrokeWidthSliderProps {
  style?: IAnnotationStyle;
  onChange?: (property: string, value: number) => void;
  sliderProps?: object;
  min?: number;
  max?: number;
  hideInput?: boolean;
}

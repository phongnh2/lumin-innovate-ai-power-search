import { ToolName } from 'core/type';

export type MapToolButtonObject = Record<ToolName, IToolButton>;

export interface IToolButton {
  readonly dataElement: string;
  readonly title: string;
  readonly img: string;
  readonly group?: string;
  readonly showColor: string;
}

export interface IAnnotationStyle {
  StrokeColor: Core.Annotations.Color;
  FillColor: Core.Annotations.Color;
  TextColor: Core.Annotations.Color;
  Opacity: number;
  StrokeThickness: number;
  FontSize: string;
  Width: number;
  Height: number;
  Font: string;
  TextAlign: 'left' | 'center' | 'right';
  FontStyle: string | Core.Annotations.Annotation.RichTextCSSStyle;
}

export interface IRGBAColor {
  R: number;
  G: number;
  B: number;
  A: number;
}

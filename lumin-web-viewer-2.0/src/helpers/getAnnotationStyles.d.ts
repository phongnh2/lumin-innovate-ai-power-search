declare const getAnnotationStyles: (annotation: Core.Annotations.Annotation) => {
  FillColor: Core.Annotations.Color;
  StrokeColor: Core.Annotations.Color;
  Opacity: number;
  StrokeThickness: number;
  FontSize: string;
  Precision: number;
  Scale: number;
  Style: string;
  Font: string;
  FontStyle: string;
  Width: number;
  Height: number;
  TextAlign: 'left' | 'center' | 'right';
  TextColor: Core.Annotations.Color;
};

export default getAnnotationStyles;
export interface IStylePaletteProps {
  style: object;
  annotation?: Core.Annotations.Annotation;
  showTextDecoration?: boolean;
  onChange: (property: string, value: object | string | number) => void;
}

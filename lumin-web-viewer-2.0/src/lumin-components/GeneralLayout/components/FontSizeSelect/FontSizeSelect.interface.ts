export interface IFontSizeSelectProps {
  maxFontSize: number;
  onChange: (arg: string) => void;
  value: string;
}

export interface ISelectOption {
  value: string | number;
  label: string;
}

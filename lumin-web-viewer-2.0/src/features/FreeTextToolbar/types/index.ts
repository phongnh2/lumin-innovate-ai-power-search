import { IAnnotationStyle } from 'interfaces/viewer/viewer.interface';

export interface BaseFreeTextToolbarSelectorProps {
  style?: IAnnotationStyle;
  annotation?: Core.Annotations.Annotation;
  onChange: (property: string, value: object | string | number) => void;
}

export interface SelectorPopoverProps {
  width?: number;
  isOpen?: boolean;
  trigger: React.ReactNode;
  content: React.ReactNode;
  triggerProps: {
    tooltip: string;
    buttonProps?: Record<string, unknown>;
  };
  onToggle?: () => void;
}

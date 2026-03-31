export interface IconButtonProps {
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  children?: React.ReactNode;
  tooltipData?: {
    location?: string;
    title?: string;
    shortcut?: string;
  };
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  size?: 'medium' | 'small' | 'large';
  className?: string;
  style?: React.CSSProperties;
  active?: boolean;
  component?: React.ReactNode;
}
declare const IconButton: (props: IconButtonProps) => JSX.Element;

export default IconButton;

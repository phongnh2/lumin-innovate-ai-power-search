export interface IInlineAlertProps {
  type: 'info' | 'warning' | 'error';
  title: string;
  icon?: string;
  btnTitle?: string;
  extra?: JSX.Element;
  onBtnClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export interface IWrapperProps {
  $bgColor: string;
  $color: string;
}

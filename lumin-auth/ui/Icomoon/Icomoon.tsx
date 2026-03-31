import classNames from 'classnames';
import { CSSProperties } from 'react';

interface IProps {
  type: string;
  size?: number | string;
  className?: string | undefined;
  color?: string | undefined;
  style?: CSSProperties;
  tabIndex?: number;
}

function Icomoon({ type, size = 16, className, color, style, ...otherProps }: IProps) {
  return <i {...otherProps} style={{ fontSize: size, color, ...style }} className={classNames(`icon-${type}`, className)} />;
}

export default Icomoon;

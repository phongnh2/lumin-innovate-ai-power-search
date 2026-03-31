import { Collapse } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';

import { containerCss } from './Alert.styled';

interface IAlertProps {
  children: ReactNode;
  className?: string;
  show?: boolean;
  autoHideDuration?: number;
}

const DEFAULT_AUTO_HIDE_TIMER = undefined;

const Alert = ({ children, className, show, autoHideDuration = DEFAULT_AUTO_HIDE_TIMER, ...otherProps }: IAlertProps) => {
  const [showState, setShow] = useState(show);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (autoHideDuration) {
      timeout = setTimeout(() => {
        setShow(false);
      }, autoHideDuration);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [autoHideDuration, show]);

  useEffect(() => {
    setShow(show);
  }, [show]);

  return (
    <Collapse in={showState}>
      <div {...otherProps} className={className} css={containerCss}>
        {children}
      </div>
    </Collapse>
  );
};

export default Alert;

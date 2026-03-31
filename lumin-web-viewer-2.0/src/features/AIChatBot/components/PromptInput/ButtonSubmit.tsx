import { Button, ButtonProps } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './PromptInput.module.scss';

type ButtonSubmitProps = ButtonProps & {
  icon: React.ReactElement;
};

const ButtonSubmit = ({ onClick, icon, ...otherProps }: ButtonSubmitProps) => (
  <Button
    onClick={onClick}
    startIcon={icon}
    size="sm"
    classNames={{
      root: styles.buttonRoot,
    }}
    {...otherProps}
  />
);

export default ButtonSubmit;

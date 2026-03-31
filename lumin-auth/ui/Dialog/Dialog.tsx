import { isValidElement } from 'react';

import { DialogProps } from './interfaces';
import { DialogSize } from './types';
import * as Styled from './Dialog.styled';

function Dialog({ children, open, title, size, onClose }: DialogProps) {
  return (
    <Styled.Dialog onClose={onClose} open={open} size={size}>
      {isValidElement(title) ? (
        title
      ) : (
        <Styled.Title level={4} align='center'>
          {title}
        </Styled.Title>
      )}
      {children}
    </Styled.Dialog>
  );
}

Dialog.defaultProps = {
  size: DialogSize.SM,
  title: undefined
};

export default Dialog;

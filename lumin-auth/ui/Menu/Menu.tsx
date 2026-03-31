import React, { ReactNode } from 'react';

import * as Styled from './styled';

function Menu({ children, closePopper }: IProps) {
  return (
    <Styled.Menu>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as TMenuChild, { closePopper });
        }
        return child;
      })}
    </Styled.Menu>
  );
}

interface IProps {
  children: ReactNode;
  closePopper?: () => void;
}

type TMenuChild = React.ReactElement<{ closePopper: () => void }>;

export default Menu;

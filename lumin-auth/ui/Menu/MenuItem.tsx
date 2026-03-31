import React, { isValidElement, ReactNode, forwardRef } from 'react';

import Icomoon from '../Icomoon';
import { Text } from '../Text';
import { TextVariantType } from '../Text/interfaces';

import * as Styled from './styled';

interface IProps {
  icon?: ReactNode;
  iconSize?: number;
  label?: ReactNode;
  rightBlock?: ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  ellipsis?: boolean;
  component?: any;
  href?: string;
  closeOnDone?: boolean;
  closePopper?: () => void;
  variant?: TextVariantType;
}

const MenuItem = forwardRef<HTMLLIElement, IProps>(
  ({ icon, label, rightBlock, onClick: onClickProp, ellipsis, component, href, iconSize, closeOnDone = false, closePopper, variant }, ref) => {
    const onClick = async (e: React.MouseEvent) => {
      if (onClickProp) {
        await onClickProp(e);
      }
      if (closeOnDone && closePopper) {
        closePopper();
      }
    };

    return (
      <Styled.MenuItem ref={ref} onClick={onClick} component={component} href={href} tabIndex={1}>
        {isValidElement(icon) ? icon : <MenuIcon icon={icon} iconSize={iconSize} />}
        {isValidElement(label) ? (
          label
        ) : (
          <Text variant={variant} ellipsis={ellipsis}>
            {label}
          </Text>
        )}
        {rightBlock}
      </Styled.MenuItem>
    );
  }
);

MenuItem.displayName = 'MenuItem';

function MenuIcon({ icon, iconSize }: Pick<IProps, 'icon' | 'iconSize'>) {
  if (!icon) return null;

  return (
    <Styled.IconWrapper style={{ width: iconSize }}>
      {isValidElement(icon) ? icon : <Icomoon size={iconSize} type={String(icon)} style={{ width: '100%' }} />}
    </Styled.IconWrapper>
  );
}

export default MenuItem;

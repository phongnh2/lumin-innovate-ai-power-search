import { ArrowUpRightIcon } from '@luminpdf/icons/dist/csr/ArrowUpRight';
import classNames from 'classnames';
import { MenuItemBase, MenuItemBaseProps } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Link } from 'react-router-dom';

import { useViewerMatch } from 'hooks/useViewerMatch';

import styles from './LinkComponent.module.scss';

const LinkComponent = (props: React.ComponentProps<typeof Link>) => {
  const { isViewer } = useViewerMatch();
  return <Link target={isViewer ? '_blank' : undefined} {...props} />;
};

export const MenuItemLink = ({
  to,
  children,
  ...props
}: {
  to: string;
  children: React.ReactNode;
  props: MenuItemBaseProps;
}) => {
  const { isViewer } = useViewerMatch();
  return (
    <Link tabIndex={-1} to={to} target={isViewer ? '_blank' : undefined}>
      <MenuItemBase
        className={classNames(styles.menuItem)}
        rightSection={isViewer && <ArrowUpRightIcon size={16} />}
        {...props}
      >
        {children}
      </MenuItemBase>
    </Link>
  );
};

export default LinkComponent;

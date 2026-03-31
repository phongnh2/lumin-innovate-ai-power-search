import React, { createContext, useMemo } from 'react';

type Props = {
  order?: number;
  customLabel?: string;
  renderAsMenuItem?: boolean;
  showOptionButton?: boolean;
  onChangeNavigationTab?: () => boolean;
  children: React.ReactNode;
};

export const ToolbarItemContext = createContext({
  collapsibleOrder: 0,
  customLabel: '',
  renderAsMenuItem: false,
  showOptionButton: true,
  onChangeNavigationTab: () => true as boolean,
});

const ToolbarItem = (props: Props) => {
  const {
    order,
    children,
    customLabel,
    renderAsMenuItem,
    showOptionButton,
    onChangeNavigationTab = () => true,
  } = props;

  const itemContext = useMemo(
    () => ({ collapsibleOrder: order, customLabel, renderAsMenuItem, showOptionButton, onChangeNavigationTab }),
    [order, customLabel, renderAsMenuItem, showOptionButton, onChangeNavigationTab]
  );

  return <ToolbarItemContext.Provider value={itemContext}>{children}</ToolbarItemContext.Provider>;
};

export default ToolbarItem;

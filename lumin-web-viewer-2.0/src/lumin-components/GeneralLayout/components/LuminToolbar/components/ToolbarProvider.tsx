import React, { useContext, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';

import ToolbarRightSectionMenu from 'luminComponents/ToolbarRightSection/components/ToolbarRightSectionMenu';

import fireEvent from 'helpers/fireEvent';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { ToolbarProviderContext } from './ToolbarContext';
import { useCollapsingToolbar } from '../hooks/useCollapsingToolbar';
import { ToolbarContext } from '../LuminToolbar';
import * as Styled from '../LuminToolbar.styled';

type Props = {
  children: React.ReactNode;
  numberOfToolsItem: number;
  toolName: string;
  isInReadAloudMode: boolean;
};

const ToolbarProvider = (props: Props) => {
  const { children, numberOfToolsItem, toolName, isInReadAloudMode } = props;
  const toolbarContext = useContext(ToolbarContext);
  const { isCollapsing, currentCollapsed } = useCollapsingToolbar({ numberOfToolsItem, ...toolbarContext });
  const toolbarProvider = useMemo(() => ({ collapsedItem: currentCollapsed, toolName }), [currentCollapsed, toolName]);

  useEffect(() => {
    if (isCollapsing) {
      return;
    }
    fireEvent(CUSTOM_EVENT.TOOLBAR_RIGHT_SECTION_LOADED, { isToolbarPopoverVisible: currentCollapsed === null });
  }, [isCollapsing, currentCollapsed]);

  if (currentCollapsed === null && !isInReadAloudMode) {
    return <ToolbarRightSectionMenu />;
  }

  return (
    <Styled.ToolbarSectionWrapper $hide={isCollapsing}>
      <ToolbarProviderContext.Provider value={toolbarProvider}>{children}</ToolbarProviderContext.Provider>
    </Styled.ToolbarSectionWrapper>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarProvider);

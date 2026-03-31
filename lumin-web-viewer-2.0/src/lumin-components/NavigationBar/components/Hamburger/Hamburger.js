import Drawer from '@mui/material/Drawer';
import { makeStyles } from '@mui/styles';
import { Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import React, { useMemo, useState } from 'react';

import { LeftSidebarDrawer } from '@web-new-ui/components/LeftSidebarDrawer';

import Icomoon from 'lumin-components/Icomoon';
import LeftSidebar from 'lumin-components/LeftSidebar';

import { useEnableWebReskin, useTabletMatch } from 'hooks';

import { Colors } from 'constants/styles';

import { HamburgerContext } from './context';
import * as Styled from '../../NavigationBar.styled';

const useStyles = makeStyles({
  drawerRoot: {
    zIndex: '111 !important',
  },
  drawerPaper: {
    overflow: 'visible',
  },
  list: {
    width: 240,
    height: '100%',
  },
});

function Hamburger() {
  const classes = useStyles();
  const tabletMatch = useTabletMatch();

  const { isEnableReskin } = useEnableWebReskin();

  const [open, setOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleDrawer = () => setOpen((prevState) => !prevState);

  const contextValue = useMemo(
    () => ({
      isSidebarOpen,
      closeMenu: () => setOpen(false),
    }),
    [isSidebarOpen]
  );

  return (
    <>
      {isEnableReskin ? (
        <Styled.HamburgerButtonReskin
          size="lg"
          icon={<KiwiIcomoon type="hamburger-lg" size="lg" color="var(--kiwi-colors-surface-on-surface)" />}
          onClick={toggleDrawer}
        />
      ) : (
        <Styled.HamburgerButton data-cy="hamburger_button_tablet" onClick={toggleDrawer}>
          <Icomoon className="listview" size={tabletMatch ? 20 : 16} color={Colors.SECONDARY} />
        </Styled.HamburgerButton>
      )}
      {isEnableReskin ? (
        <LeftSidebarDrawer opened={open} onClose={() => setOpen(false)} />
      ) : (
        <Drawer
          anchor="left"
          open={open}
          onClose={() => setOpen(false)}
          onTransitionEnd={() => setSidebarOpen(true)}
          classes={{
            root: classes.drawerRoot,
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.list}>
            <HamburgerContext.Provider value={contextValue}>
              <LeftSidebar />
            </HamburgerContext.Provider>
          </div>
        </Drawer>
      )}
    </>
  );
}

export default Hamburger;

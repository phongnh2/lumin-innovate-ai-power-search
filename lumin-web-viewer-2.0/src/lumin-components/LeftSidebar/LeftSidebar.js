import React, { useContext } from 'react';
import { useLocation } from 'react-router';

import LuminLogo from 'assets/lumin-svgs/logo-lumin.svg';

import Icomoon from 'lumin-components/Icomoon';
import { HamburgerContext } from 'lumin-components/NavigationBar/components/Hamburger/context';
import Scrollbars from 'lumin-components/Shared/CustomScroll';

import { matchPaths } from 'helpers/matchPaths';

import { ORGANIZATION_ROUTERS } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';

import SidebarOrgInfo from './components/SidebarOrgInfo';
import SidebarOrgMenu from './components/SidebarOrgMenu';
import SidebarPersonalInfo from './components/SidebarPersonalInfo';
import SidebarPersonalMenu from './components/SidebarPersonalMenu';

import * as Styled from './LeftSidebar.styled';

function LeftSidebar() {
  const { closeMenu } = useContext(HamburgerContext) || {};
  const location = useLocation();
  const orgRouteMatch = matchPaths(
    ORGANIZATION_ROUTERS.map((path) => ({ path, end: false })),
    location.pathname
  );
  return (
    <Scrollbars
      autoHide
      autoHeightMax="100%"
      style={{
        maxHeight: '100%',
        height: '100%',
      }}
    >
      <Styled.Container>
        <Styled.Block>
          <Styled.Header>
            <Styled.LogoWrapper>
              <Styled.CloseButton onClick={closeMenu}>
                <Icomoon className="cancel" size={12} color={Colors.NEUTRAL_60} />
              </Styled.CloseButton>
              <Styled.LogoLink replace to="/">
                <img src={LuminLogo} alt="lumin-logo" />
              </Styled.LogoLink>
            </Styled.LogoWrapper>
            {orgRouteMatch ? <SidebarOrgInfo /> : <SidebarPersonalInfo />}
          </Styled.Header>
        </Styled.Block>

        <Styled.ContentWrapper>
          <Styled.Block middleBlock>{orgRouteMatch ? <SidebarOrgMenu /> : <SidebarPersonalMenu />}</Styled.Block>
        </Styled.ContentWrapper>
      </Styled.Container>
    </Scrollbars>
  );
}

export default LeftSidebar;

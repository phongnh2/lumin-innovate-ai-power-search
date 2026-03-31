import { Icomoon as KiwiIcomoon, Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { HelpCenterButton } from '@web-new-ui/components/HelpCenterButton';
import { PageSearchInput } from '@web-new-ui/components/PageSearchInput';

import Logo from 'assets/lumin-svgs/logo-lumin.svg';

import selectors from 'selectors';

import DocumentStack from 'lumin-components/DocumentStack';
import Icomoon from 'lumin-components/Icomoon';
import NavigationBarHOC from 'luminComponents/NavigationBarHOC';
import NotificationGroupQuery from 'luminComponents/NotificationGroupQuery';
import OfflineUpdateButton from 'luminComponents/OfflineUpdateButton';
import PageTitlePortal from 'luminComponents/PortalElement/PageTitlePortal';
import ProfileButton from 'luminComponents/ProfileButton';

import { useDesktopMatch, useHomeMatch, useNoConnectionState, useTranslation, useEnableWebReskin } from 'hooks';
import { useCheckNewPriceModel } from 'hooks/useCheckNewPriceModel';

import { matchPaths } from 'helpers/matchPaths';

import useShowWebChatbot from 'features/WebChatBot/hooks/useShowWebChatbot';

import { ROUTE_MATCH } from 'constants/Routers';
import { Colors } from 'constants/styles';

import ButtonGroup from './components/ButtonGroup';
import ButtonHelpCenter from './components/ButtonHelpCenter';
import Hamburger from './components/Hamburger';

import * as Styled from './NavigationBar.styled';

const NavigationBar = ({ title }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isDesktopMatch = useDesktopMatch();
  const isOffline = useSelector(selectors.isOffline);
  const { showPermanent } = useNoConnectionState();
  const { isHomePage } = useHomeMatch();
  const { isHideDocStackBar } = useCheckNewPriceModel();

  const [isShowSearchView, setIsShowSearchView] = useState(false);

  const isDocumentRouteMatch = Boolean(
    matchPaths(
      [
        ROUTE_MATCH.ORG_DOCUMENT,
        ROUTE_MATCH.ORGANIZATION_DOCUMENTS,
        ROUTE_MATCH.FOLDER_DOCUMENT,
        ROUTE_MATCH.TEAM_DOCUMENT,
        ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT.TEAM,
        ROUTE_MATCH.PREMIUM_USER_PATHS.FOLDER_DOCUMENTS,
        ROUTE_MATCH.PREMIUM_USER_PATHS.PERSONAL_DOCUMENTS,
        ROUTE_MATCH.PREMIUM_USER_PATHS.SHARED_DOCUMENTS,
        ROUTE_MATCH.PREMIUM_USER_PATHS.STARRED_DOCUMENT,
      ],
      location.pathname
    )
  );

  const isHaveSearchInput = isHomePage || isDocumentRouteMatch;

  const { isEnableReskin } = useEnableWebReskin();

  const { isShowWebChatbot } = useShowWebChatbot();

  const openSearchView = () => setIsShowSearchView(true);

  const closeSearchView = () => setIsShowSearchView(false);

  const renderTitle = () => {
    if (title) {
      return <Styled.Title>{t(title)}</Styled.Title>;
    }
    if (isEnableReskin) {
      return (
        <Styled.LuminLogoWrapper to="/">
          <Styled.LuminLogoReskin src={Logo} alt="Lumin logo" />
        </Styled.LuminLogoWrapper>
      );
    }
    return <PageTitlePortal.Portal />;
  };

  const renderOfflineContent = () => (
    <>
      <Icomoon className="no-internet" color={Colors.SECONDARY_50} size={18} />
      <Styled.OfflineText>{t('common.noInternet')}</Styled.OfflineText>
    </>
  );

  const renderLeftSection = () => {
    if (!isEnableReskin) {
      return isDesktopMatch ? (
        renderTitle()
      ) : (
        <Styled.Left>
          <Hamburger />
          <Link to="/">
            <Styled.LuminLogo src={Logo} alt="Lumin logo" />
          </Link>
        </Styled.Left>
      );
    }

    return (
      <Styled.Left>
        {!isDesktopMatch && <Hamburger />}
        {renderTitle()}
      </Styled.Left>
    );
  };

  const ReskinComponents = isEnableReskin
    ? {
        Container: Styled.ContainerReskin,
        Body: Styled.BodyReskin,
        Group: Styled.Group,
        Right: Styled.RightReskin,
      }
    : {
        Container: Styled.Container,
        Body: Styled.Body,
        Group: React.Fragment,
        Right: Styled.Right,
      };

  const { findDocumentByName } = useSelector(selectors.getPageSearchData);

  useEffect(() => {
    if (findDocumentByName) {
      openSearchView();
    }
  }, [findDocumentByName]);

  const shouldShowSearchView = isEnableReskin && isHaveSearchInput && !isDesktopMatch && isShowSearchView;

  return (
    <ReskinComponents.Container>
      <Styled.TopHeader>
        {showPermanent && renderOfflineContent()}
        {!isEnableReskin && !isHideDocStackBar && <DocumentStack />}
      </Styled.TopHeader>
      <ReskinComponents.Body $displayFullItems={isHaveSearchInput && isDesktopMatch}>
        {renderLeftSection()}
        {isEnableReskin && isHaveSearchInput && isDesktopMatch && <PageSearchInput />}
        <ReskinComponents.Right $isDisabled={isOffline}>
          <ButtonGroup openSearchView={openSearchView} isEnabledWebChatbot={isShowWebChatbot} />
          <ReskinComponents.Group>
            {isEnableReskin ? <HelpCenterButton /> : <ButtonHelpCenter disabled={isOffline} />}
            <NotificationGroupQuery />
          </ReskinComponents.Group>
          <OfflineUpdateButton />
          <ProfileButton />
        </ReskinComponents.Right>
      </ReskinComponents.Body>
      {shouldShowSearchView && (
        <Styled.SearchViewContainer>
          <Button
            variant="text"
            size="lg"
            startIcon={<KiwiIcomoon size="lg" type="chevron-left-lg" color="var(--kiwi-colors-core-secondary)" />}
            onClick={closeSearchView}
          >
            {t('common.back')}
          </Button>
          <PageSearchInput closeSearchView={closeSearchView} />
        </Styled.SearchViewContainer>
      )}
    </ReskinComponents.Container>
  );
};

NavigationBar.propTypes = {
  title: PropTypes.string,
};

NavigationBar.defaultProps = {
  title: null,
};

export default NavigationBarHOC(React.memo(NavigationBar));

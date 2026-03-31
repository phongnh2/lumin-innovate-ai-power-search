import classNames from 'classnames';
import { Button, IconButton, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import FacebookSvg from 'assets/lumin-svgs/fb-social.svg';
import InsSvg from 'assets/lumin-svgs/ins-social.svg';
import LinkeinSvg from 'assets/lumin-svgs/linke-social.svg';
import Logo from 'assets/lumin-svgs/logo-lumin.svg';
import TwitterSvg from 'assets/lumin-svgs/twitter-social.svg';
import YtSvg from 'assets/lumin-svgs/yt-social.svg';

import action from 'actions';

import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import Icomoon from 'lumin-components/Icomoon';
import EditorThemeProvider from 'luminComponents/ViewerCommonV2/ThemeProvider/EditorThemeProvider';

import { useMobileMatch, useTranslation } from 'hooks';

import { Routers } from 'constants/Routers';
import { SOCIAL_NETWORKS_LINK } from 'constants/socialNetwork';
import { Colors } from 'constants/styles';

import * as Styled from './Layout.styled';

import styles from './LayoutSecondary.module.scss';

const SocialMediaList = [
  {
    icon: FacebookSvg,
    url: SOCIAL_NETWORKS_LINK.FACEBOOK,
  },
  {
    icon: LinkeinSvg,
    url: SOCIAL_NETWORKS_LINK.LINKEDIN,
  },
  {
    icon: TwitterSvg,
    url: SOCIAL_NETWORKS_LINK.TWITTER,
  },
  {
    icon: InsSvg,
    url: SOCIAL_NETWORKS_LINK.INSTAGRAM,
  },
  {
    icon: YtSvg,
    url: SOCIAL_NETWORKS_LINK.YOUTUBE,
  },
];

LayoutSecondary.propTypes = {
  children: PropTypes.any.isRequired,
  footer: PropTypes.bool,
  staticPage: PropTypes.bool,
  backgroundColor: PropTypes.string,
  hasBackButton: PropTypes.bool,
  canClickLogo: PropTypes.bool,
  onClickBackButton: PropTypes.func,
  disabledBackButton: PropTypes.bool,
  badRequestLayout: PropTypes.bool,
  isReskin: PropTypes.bool,
  hasLogo: PropTypes.bool,
  backButtonText: PropTypes.string,
  withScrollRef: PropTypes.bool,
  withCenterFrame: PropTypes.bool,
  cancellationPage: PropTypes.bool,
};

LayoutSecondary.defaultProps = {
  footer: true,
  staticPage: false,
  backgroundColor: 'transparent',
  hasBackButton: true,
  canClickLogo: true,
  onClickBackButton: null,
  disabledBackButton: false,
  badRequestLayout: false,
  isReskin: false,
  hasLogo: true,
  backButtonText: '',
  withScrollRef: false,
  withCenterFrame: false,
  cancellationPage: false,
};

function LayoutSecondary(props) {
  const dispatch = useDispatch();
  const {
    children,
    footer,
    staticPage,
    backgroundColor,
    hasBackButton,
    canClickLogo,
    onClickBackButton,
    disabledBackButton,
    badRequestLayout,
    isReskin,
    hasLogo,
    backButtonText,
    withScrollRef,
    withCenterFrame,
    cancellationPage,
    ...otherProps
  } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { bodyScrollRef } = useContext(AppLayoutContext);

  const isMobile = useMobileMatch();

  const onClickBack = () => {
    if (onClickBackButton) {
      onClickBackButton();
      return;
    }

    if (!location.key || location.state?.from === Routers.SIGNIN) {
      navigate('/');
      return;
    }

    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  const onClickLogo = () => {
    if (!canClickLogo) {
      return;
    }
    dispatch(action.setWrongIpStatus({ email: null, open: false }));
    dispatch(action.setMembershipOfOrg({ require: false, email: '' }));
    navigate('/');
  };

  const renderContentWithFrame = () => {
    if (badRequestLayout) {
      return (
        <>
          <Styled.NewFrameLayout $isSupportLink={otherProps.supportLink}>{children}</Styled.NewFrameLayout>
          {otherProps.supportLink || null}
        </>
      );
    }
    if (isReskin && withCenterFrame) {
      return <div className={styles.centerFrame}>{children}</div>;
    }
    return children;
  };

  const renderHeader = () => {
    if (isReskin) {
      return (
        <header className={classNames(styles.header, { [styles.noBackground]: badRequestLayout || withCenterFrame })}>
          {hasBackButton &&
            !staticPage &&
            (isMobile && !cancellationPage ? (
              <IconButton
                variant="text"
                size="lg"
                icon="chevron-left-lg"
                iconColor="var(--kiwi-colors-core-secondary)"
                disabled={disabledBackButton}
                onClick={onClickBack}
              />
            ) : (
              <Button
                variant="text"
                size="lg"
                startIcon={<KiwiIcomoon type="chevron-left-lg" color="var(--kiwi-colors-core-secondary)" size="lg" />}
                color="var(--kiwi-colors-core-secondary)"
                onClick={onClickBack}
                disabled={disabledBackButton}
              >
                {backButtonText || t('common.back')}
              </Button>
            ))}
          {hasLogo && (
            <div className={classNames(styles.headerContent, { [styles.staticPage]: staticPage })}>
              <div
                className={classNames(styles.logoWrapper, { [styles.disabled]: !canClickLogo })}
                role="presentation"
                onClick={onClickLogo}
              >
                <img src={Logo} alt="Lumin logo" />
              </div>
            </div>
          )}
        </header>
      );
    }
    return (
      <Styled.Header $brLayout={badRequestLayout}>
        {hasBackButton && !staticPage && (
          <Styled.BackWrapper $disabled={disabledBackButton} $isStaticPage={staticPage}>
            <ButtonMaterial onClick={onClickBack} color={ButtonColor.GHOST} disabled={disabledBackButton}>
              <Icomoon style={{ marginRight: 12 }} className="arrow-left-alt" size={12} color={Colors.NEUTRAL_80} />
              <Styled.BackText>{backButtonText || t('common.back')}</Styled.BackText>
            </ButtonMaterial>
          </Styled.BackWrapper>
        )}
        {hasLogo && (
          <Styled.LogoContainer $isStaticPage={staticPage}>
            <Styled.Link $disabled={!canClickLogo} onClick={onClickLogo}>
              <Styled.LogoIcon src={Logo} alt="Lumin logo" />
            </Styled.Link>
          </Styled.LogoContainer>
        )}
      </Styled.Header>
    );
  };

  return (
    <EditorThemeProvider>
      <Styled.Container
        ref={withScrollRef ? bodyScrollRef : undefined}
        className={isReskin ? undefined : 'custom-scrollbar'}
        $brLayout={badRequestLayout}
        $withCenterFrame={isReskin && withCenterFrame}
        $reskinScrollbar={isReskin}
      >
        {renderHeader()}
        <Styled.Main
          $footer={footer}
          $isStaticPage={staticPage}
          $backgroundColor={backgroundColor}
          $brLayout={badRequestLayout}
          $isSupportLink={otherProps.supportLink}
          $withCenterFrame={isReskin && withCenterFrame}
        >
          {renderContentWithFrame()}
        </Styled.Main>
        {footer && (
          <Styled.Footer>
            <Styled.FooterText>
              © 2014 - {new Date().getFullYear()} Nitrolabs Limited | Christchurch, New Zealand |{' '}
              {t('common.allRightsReserved')}
            </Styled.FooterText>
            <Styled.Divider />
            <Styled.SocialFooter>
              {SocialMediaList.map((item, index) => (
                <Styled.SocialLink href={item.url} key={`key-${index}`}>
                  <Styled.IconSocial src={item.icon} />
                </Styled.SocialLink>
              ))}
            </Styled.SocialFooter>
          </Styled.Footer>
        )}
      </Styled.Container>
    </EditorThemeProvider>
  );
}

export default LayoutSecondary;

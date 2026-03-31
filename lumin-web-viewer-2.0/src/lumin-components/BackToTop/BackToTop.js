import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSpring, config } from 'react-spring';
import { useMedia } from 'react-use';

import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';

import { useLayoutScroll, useTranslation } from 'hooks';

import { useRightPanelStore } from 'features/WebRightPanel/hooks/useRightPanelStore';

import { Breakpoints } from 'constants/styles';

import * as Styled from './BackToTop.styled';

const propTypes = {
  stickAt: PropTypes.number,
};
const defaultProps = {
  stickAt: null,
};

const TRANSLATE_DISTANCE_RESKIN = 32;
const TRANSLATE_DISTANCE_MOBILE = 20;
const THROTTLE_TIME = 100;
// 5s delay before automatically hiding the button after scrolling up stops
const BUTTON_AUTO_HIDE_TIMEOUT = 5000;

function BackToTop({ stickAt }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const lastScrollYRef = useRef(0);
  const ref = useRef();
  const isMobile = useMedia(`(max-width: ${Breakpoints.sm}px)`);
  const openUploadingPopper = useSelector(selectors.isOpenUploadingPopper);
  const { activePanel } = useRightPanelStore();

  const distance = useMemo(() => (isMobile ? TRANSLATE_DISTANCE_MOBILE : -TRANSLATE_DISTANCE_RESKIN), [isMobile]);

  const canShowButton = isMobile ? show : show && !openUploadingPopper;

  const springProps = useSpring({
    config: {
      ...config.gentle,
      duration: 300,
    },
    transform: canShowButton ? `translateY(${distance}px)` : 'translateY(0px)',
    opacity: canShowButton ? 1 : 0,
    pointerEvents: canShowButton ? 'auto' : 'none',
  });

  const handleScroll = useCallback(
    throttle((el) => {
      const scrollY = el.scrollTop;
      setShow(Boolean(scrollY) && scrollY < lastScrollYRef.current);
      lastScrollYRef.current = scrollY;
    }, THROTTLE_TIME),
    []
  );

  const { scrollTop } = useLayoutScroll(handleScroll);

  const iconSize = isMobile ? 14 : 18;

  useEffect(() => {
    if (canShowButton) {
      clearTimeout(ref.current);
      ref.current = setTimeout(() => {
        setShow(false);
      }, BUTTON_AUTO_HIDE_TIMEOUT);
    }
  }, [canShowButton]);

  return (
    <Styled.ContainerReskin
      $canShowButton={canShowButton}
      $activePanel={activePanel}
      stickAt={isMobile && stickAt ? stickAt + distance : null}
    >
      <Styled.BadgeContainerReskin style={springProps} onClick={scrollTop}>
        <Icomoon className="increase" size={iconSize} />
        <Styled.TextReskin className="kiwi-typography-label-lg">{t('common.backToTop')}</Styled.TextReskin>
      </Styled.BadgeContainerReskin>
    </Styled.ContainerReskin>
  );
}

BackToTop.propTypes = propTypes;
BackToTop.defaultProps = defaultProps;

export default React.memo(BackToTop);

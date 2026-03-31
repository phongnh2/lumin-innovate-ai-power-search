import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import CookieWarningContext from 'lumin-components/CookieWarningModal/Context';

import withOneClickUpgrade from 'HOC/withOneClickUpgrade';

import { useKratos } from 'hooks/useKratos';

import { BannerActorType } from 'constants/banner';

import BannerContext from './BannerContext';
import { useAttachHotjarAttributes } from './hooks/useAttachHotjarAttributes';
import { useCustomHotjarTrackingEvent } from './hooks/useCustomHotjarTrackingEvent';
import Router from './Router';

type ThirdPartyCookieProps = {
  cookieWarning: boolean;
  cookiesDisabled: boolean;
};
type Props = {
  cookieData: ThirdPartyCookieProps;
  setCookieData: Dispatch<SetStateAction<ThirdPartyCookieProps>>;
};

function RouterContextProvider({ cookieData, setCookieData, ...rest }: Props): JSX.Element {
  const isAuthenticating = useSelector<unknown, boolean>(selectors.isAuthenticating);
  const [showBannerOrg, setShowBannerOrg] = useState(true);
  const [showBannerPersonal, setShowBannerPersonal] = useState(true);
  const { cookieWarning, cookiesDisabled } = cookieData;
  const cookieContext = useMemo(
    () => ({
      isVisible: cookieWarning,
      cookiesDisabled,
      setCookieModalVisible: (_cookieWarning: boolean) =>
        setCookieData((prev) => ({ ...prev, cookieWarning: _cookieWarning })),
    }),
    [cookieWarning, cookiesDisabled, setCookieData]
  );

  const setShowBanner = useCallback(({ status, type }: { status: boolean; type: string }) => {
    if (type === BannerActorType.PERSONAL) {
      setShowBannerPersonal(status);
    } else {
      setShowBannerOrg(status);
    }
  }, []);

  const bannerContext = useMemo(
    () => ({
      showBannerOrg,
      showBannerPersonal,
      setShowBanner,
    }),
    [showBannerOrg, showBannerPersonal, setShowBanner]
  );

  useAttachHotjarAttributes();
  useCustomHotjarTrackingEvent();

  const authenticate = useKratos();

  const otherProps = {
    authenticate,
    isAuthenticating,
  };

  return (
    <CookieWarningContext.Provider value={cookieContext}>
      <BannerContext.Provider value={bannerContext}>
        <Router {...rest} {...otherProps} />
      </BannerContext.Provider>
    </CookieWarningContext.Provider>
  );
}

export default compose(withOneClickUpgrade)(RouterContextProvider);

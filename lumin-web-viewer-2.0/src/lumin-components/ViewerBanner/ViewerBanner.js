import classNames from 'classnames';
import React, { isValidElement, useRef } from 'react';

import Button from 'lumin-components/ViewerCommon/ButtonLumin';
import ButtonMaterial from 'luminComponents/ButtonMaterial';

import useBannerData from './hooks/useBannerData';

import './ViewerBanner.scss';

const ViewerBanner = () => {
  const { selectedBanner, onClickBannerLink, onClickCloseBanner, shouldShowBanner } = useBannerData();

  const bannerTrackingRef = useRef(null);
  const classProp = classNames({
    ViewerBanner: true,
  });

  if (!shouldShowBanner) {
    return null;
  }

  const TitleComponent = isValidElement(selectedBanner.title) ? 'div' : 'p';

  return (
    <div className={classProp} ref={bannerTrackingRef}>
      <div className="ViewerBanner__wrapper ViewerBanner__wrapper--hidden">
        <div className="ViewerBanner__content">
          <TitleComponent
            className={classNames('ViewerBanner__message', {
              [selectedBanner.titleClassname]: selectedBanner.titleClassname,
            })}
          >
            {selectedBanner.title}
          </TitleComponent>
          <ButtonMaterial
            onClick={onClickBannerLink}
            className={classNames('ViewerBanner__btn', {
              [selectedBanner.btnClassName]: selectedBanner.btnClassName,
            })}
          >
            {selectedBanner.btnData.btnContent}
          </ButtonMaterial>
        </div>
        <div>
          <Button className="ViewerBanner__close-btn" onClick={onClickCloseBanner} icon="cancel" />
        </div>
      </div>
    </div>
  );
};

export default ViewerBanner;

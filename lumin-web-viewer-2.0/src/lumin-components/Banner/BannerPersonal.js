import dayjs from 'dayjs';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import { useTranslation } from 'hooks';
import { useTrackingBannerEvent } from 'hooks/useTrackingBannerEvent';

import { userServices } from 'services';

import { BannerName, BannerPurpose } from 'utils/Factory/EventCollection/BannerEventCollection';
import getCommonBanner from 'utils/getCommonBanner';

import { BannerType, BannerRateLuminState, BannerActorType } from 'constants/banner';
import { HIDE_TEMPLATE_BANNER_DATE } from 'constants/urls';

import Banner from './Banner';

const PersonalBanner = ({ navigate, currentUser, updateCurrentUser, loading }) => {
  const { t } = useTranslation();
  const { reachUploadDocLimit } = currentUser;

  const banners = getCommonBanner(t);

  const getBannerData = () => {
    const currentDate = dayjs(new Date());
    const introduceTemplatesUntilDate = dayjs(HIDE_TEMPLATE_BANNER_DATE);
    const showIntroduceLuminTemplates = currentDate.isBefore(introduceTemplatesUntilDate);
    if (showIntroduceLuminTemplates) {
      return banners[BannerType.INTRODUCE_TEMPLATES];
    }
    const googleModalStatus = get(currentUser, 'metadata.rating.googleModalStatus');
    if (googleModalStatus === BannerRateLuminState.OPEN) {
      return banners[BannerType.RATE_LUMIN];
    }

    if (!reachUploadDocLimit) {
      banners[BannerType.UPLOAD_DOCUMENT].btnData.href = '/documents/personal';
      return banners[BannerType.UPLOAD_DOCUMENT];
    }

    return null;
  };
  const selectedBanner = getBannerData();
  const { trackBannerConfirmation } = useTrackingBannerEvent({
    bannerName:
      selectedBanner === banners[BannerType.DOWNLOAD_PWA] ? BannerName.DESKTOP_APP_DOWNLOAD_IN_RIGHT_BANNER : '',
    bannerPurpose:
      selectedBanner === banners[BannerType.DOWNLOAD_PWA]
        ? BannerPurpose[BannerName.DESKTOP_APP_DOWNLOAD_IN_RIGHT_BANNER]
        : '',
  });

  const onSubmit = async () => {
    const { btnData } = selectedBanner || {};
    const historyParams = {
      pathname: btnData.href,
      state: btnData.state,
    };

    if (btnData.search) {
      historyParams.search = btnData.search;
    }
    if (selectedBanner.id === BannerType.RATE_LUMIN) {
      const userUpdated = await userServices.hideGoogleRatingModal();
      updateCurrentUser(userUpdated);
    }
    if (
      [BannerType.BANANA_SIGN, BannerType.DOWNLOAD_PWA, BannerType.RATE_LUMIN, BannerType.INTRODUCE_TEMPLATES].includes(
        selectedBanner.id
      )
    ) {
      window.open(btnData.href, '_blank', 'noopener,noreferrer');
    } else {
      navigate(historyParams);
    }
  };
  const onClose = async () => {
    if (selectedBanner.id === BannerType.RATE_LUMIN) {
      const userUpdated = await userServices.hideGoogleRatingModal();
      updateCurrentUser(userUpdated);
    }
  };
  return (
    !loading &&
    selectedBanner && (
      <Banner
        bannerImage={selectedBanner.bannerImage}
        subTitle={selectedBanner.subTitle}
        mainTitle={selectedBanner.mainTitle}
        buttonContent={selectedBanner.btnData.btnContent}
        onSubmit={() => {
          onSubmit();
          trackBannerConfirmation();
        }}
        onClose={onClose}
        type={BannerActorType.PERSONAL}
      />
    )
  );
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  loading: selectors.getOrganizationList(state).loading,
});
const mapDispatchToProps = (dispatch) => ({
  updateCurrentUser: (currentUser) => dispatch(actions.updateCurrentUser(currentUser)),
});
PersonalBanner.propTypes = {
  navigate: PropTypes.func,
  currentUser: PropTypes.object.isRequired,
  updateCurrentUser: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

PersonalBanner.defaultProps = {
  navigate: () => {},
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter, memo)(PersonalBanner);

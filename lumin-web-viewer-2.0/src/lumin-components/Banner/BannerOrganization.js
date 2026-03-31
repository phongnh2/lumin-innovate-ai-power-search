import dayjs from 'dayjs';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import AddMemberOrganizationModal from 'lumin-components/AddMemberOrganizationModal';

import withRouter from 'HOC/withRouter';

import { useTranslation } from 'hooks';
import { useTrackingBannerEvent } from 'hooks/useTrackingBannerEvent';

import { organizationServices, userServices } from 'services';

import { BannerName, BannerPurpose } from 'utils/Factory/EventCollection/BannerEventCollection';
import { getOrgBannerData } from 'utils/orgUtils';

import { BannerActorType, BannerRateLuminState, BannerType } from 'constants/banner';
import { ORG_TEXT } from 'constants/organizationConstants';
import { Plans, PERIOD } from 'constants/plan';
import { STATIC_PAGE_PRICING } from 'constants/Routers';
import { MAX_FREE_TEAM, TEAMS_TEXT } from 'constants/teamConstant';
import { HIDE_TEMPLATE_BANNER_DATE } from 'constants/urls';

import Banner from './Banner';

const OrganizationBanner = ({ organization, currentUser, navigate, updateCurrentUser, currentOrganization }) => {
  const { totalTeam, payment, userRole, reachUploadDocLimit, url } = currentOrganization || {};
  const { t } = useTranslation();
  const [isOpenAddmemberModal, setIsOpenAddMemberModal] = useState(false);
  const { loading } = organization;
  const banners = getOrgBannerData(t);
  const isOrgManager = organizationServices.isManager(userRole);
  const showCreateTeamBanner = totalTeam < MAX_FREE_TEAM && payment.type === Plans.FREE;
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
      banners[BannerType.UPLOAD_DOCUMENT].subTitle = t('banner.uploadDocument.subTitle2');
      banners[BannerType.UPLOAD_DOCUMENT].btnData.href = `/${ORG_TEXT}/${url}/documents/${ORG_TEXT}`;
      return banners[BannerType.UPLOAD_DOCUMENT];
    }
    if (showCreateTeamBanner) {
      banners[BannerType.CREATE_TEAM].btnData.href = `/${ORG_TEXT}/${url}/${TEAMS_TEXT}`;
      return banners[BannerType.CREATE_TEAM];
    }
    if (isOrgManager) {
      banners[BannerType.FOR_FREE_ORG].btnData.href = STATIC_PAGE_PRICING;
      return payment.type === Plans.FREE ? banners[BannerType.FOR_FREE_ORG] : banners[PERIOD.MONTHLY];
    }
    return banners[BannerType.CONTACT_UPGRADE];
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
    if (BannerType.DOWNLOAD_PWA === selectedBanner.id) {
      trackBannerConfirmation();
    }
    if (selectedBanner.id === BannerType.RATE_LUMIN) {
      const userUpdated = await userServices.hideGoogleRatingModal();
      updateCurrentUser(userUpdated);
    }
    if (
      [
        BannerType.BANANA_SIGN,
        BannerType.DOWNLOAD_PWA,
        BannerType.RATE_LUMIN,
        BannerType.FOR_PREMIUM_ORG,
        BannerType.INTRODUCE_TEMPLATES,
        BannerType.FOR_FREE_ORG,
      ].includes(selectedBanner.id)
    ) {
      window.open(selectedBanner.btnData.href, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(
      {
        pathname: selectedBanner.btnData.href,
        search: selectedBanner.btnData.search,
      },
      {
        state: selectedBanner.btnData.state,
      }
    );
  };
  const onClose = async () => {
    if (selectedBanner.id === BannerType.RATE_LUMIN) {
      const userUpdated = await userServices.hideGoogleRatingModal();
      updateCurrentUser(userUpdated);
    }
  };
  const handleOnSaveAddModal = () => {
    setIsOpenAddMemberModal(false);
  };
  return (
    <>
      {!loading && (
        <Banner
          bannerImage={selectedBanner.bannerImage}
          subTitle={selectedBanner.subTitle}
          mainTitle={selectedBanner.mainTitle}
          buttonContent={selectedBanner.btnData.btnContent}
          onSubmit={onSubmit}
          onClose={onClose}
          type={BannerActorType.ORGANIZATION}
        />
      )}
      {isOpenAddmemberModal && (
        <AddMemberOrganizationModal
          open
          onClose={() => setIsOpenAddMemberModal(false)}
          onSaved={handleOnSaveAddModal}
        />
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  organization: selectors.getOrganizationList(state),
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state).data,
});
const mapDispatchToProps = (dispatch) => ({
  updateCurrentUser: (currentUser) => dispatch(actions.updateCurrentUser(currentUser)),
});

OrganizationBanner.propTypes = {
  organization: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  updateCurrentUser: PropTypes.func.isRequired,
  currentOrganization: PropTypes.object,
};

OrganizationBanner.defaultProps = {
  currentOrganization: {},
};
export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(OrganizationBanner);

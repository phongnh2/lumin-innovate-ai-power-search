import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';
import { RootState } from 'store';

import { AnimationBanner, BannerNames } from 'constants/banner';

import FeedbackStep from './components/FeedbackStep';
import RatingStep from './components/RatingStep';
import TrustpilotStep from './components/TrustpilotStep';
import { RATING_MODAL_CONSTANTS } from './constants';
import { useRatingModal } from './hooks/useRatingModal';

import styles from './RatingModal.module.scss';

const RatingModal = () => {
  const { ratingModalState, isHighRating, onClose, onClickSendFeedback, onClickTrustpilotReview, submitRating } =
    useRatingModal();

  const currentUser = useSelector(selectors.getCurrentUser);
  const isOffline = useSelector(selectors.isOffline);
  const shouldShowRatingModal = useSelector(selectors.shouldShowRating);
  const isShownCookiesBanner = useSelector((rootState: RootState) =>
    selectors.getShowedBanner(rootState, BannerNames.COOKIES)
  );

  if (shouldShowRatingModal !== AnimationBanner.SHOW || isOffline || !currentUser) {
    return null;
  }

  const containerClasses = classNames(styles.container, {
    [styles.withCookiesBanner]: isShownCookiesBanner,
    [styles.withoutCookiesBanner]: !isShownCookiesBanner,
  });

  const renderContent = () => {
    if (ratingModalState.step === RATING_MODAL_CONSTANTS.STEPS.RATING) {
      return (
        <RatingStep
          onRatingSelect={submitRating}
          isDisabled={ratingModalState.shouldDisableRatingButton}
          onClose={onClose}
        />
      );
    }

    if (isHighRating) {
      return <TrustpilotStep onClose={onClose} onClickTrustpilotReview={onClickTrustpilotReview} />;
    }

    return <FeedbackStep onClose={onClose} onClickSendFeedback={onClickSendFeedback} />;
  };

  return <div className={containerClasses}>{renderContent()}</div>;
};

export default RatingModal;

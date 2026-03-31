import { get } from 'lodash';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import userServices from 'services/userServices';

import logger from 'helpers/logger';

import messageEvent from 'utils/Factory/EventCollection/RatingModalCollection';

import { AnimationBanner } from 'constants/banner';
import { LOGGER } from 'constants/lumin-common';
import { FEEDBACK_URL, TRUSTPILOT_REVIEW_URL } from 'constants/Routers';

import { RATING_MODAL_CONSTANTS } from '../constants';

interface RatingModalState {
  step: number;
  selectedScore: number | null;
  shouldDisableRatingButton: boolean;
}

export const useRatingModal = () => {
  const dispatch = useDispatch();
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const organizations = useShallowSelector(selectors.getOrganizationList);

  const [ratingModalState, setRatingModalState] = useState<RatingModalState>({
    step: RATING_MODAL_CONSTANTS.STEPS.RATING,
    selectedScore: null,
    shouldDisableRatingButton: false,
  });

  const highestPlan = userServices.getHighestPlan(currentUser, organizations.data || []);
  const paymentType = get(currentDocument, 'documentReference.data.payment.type', '') || highestPlan.type;
  const priceVersion = get(currentDocument, 'premiumToolsInfo.priceVersion', 0) || highestPlan.priceVersion;

  const onClose = () => {
    dispatch(actions.setShouldShowRating(AnimationBanner.HIDE));
  };

  const onClickSendFeedback = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    onClose();
    window.open(FEEDBACK_URL, '_blank');
  };

  const onClickTrustpilotReview = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    onClose();
    window.open(TRUSTPILOT_REVIEW_URL, '_blank');
  };

  const submitRating = async (ratedScore: number): Promise<void> => {
    try {
      setRatingModalState((prev) => ({ ...prev, shouldDisableRatingButton: true, selectedScore: ratedScore }));

      await userServices.ratedApp({ ratedScore });
      messageEvent.onRated({
        ratedScore,
        userPlanType: paymentType,
        priceVersion,
      });

      dispatch(
        actions.updateCurrentUser({
          ...currentUser,
          metadata: {
            ...currentUser.metadata,
            ratedApp: true,
          },
        })
      );
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.GRAPHQL_ERROR,
        error: error as Error,
      });
    } finally {
      setRatingModalState((prev) => ({
        ...prev,
        step: RATING_MODAL_CONSTANTS.STEPS.FEEDBACK,
        shouldDisableRatingButton: false,
      }));
    }
  };

  const isHighRating = ratingModalState.selectedScore >= RATING_MODAL_CONSTANTS.HIGH_RATING_THRESHOLD;

  return {
    ratingModalState,
    isHighRating,
    onClose,
    onClickSendFeedback,
    onClickTrustpilotReview,
    submitRating,
  };
};

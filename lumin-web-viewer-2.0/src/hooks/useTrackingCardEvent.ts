import logger from 'helpers/logger';

import cardEvent from 'utils/Factory/EventCollection/CardEventCollection';

import { LOGGER } from 'constants/lumin-common';

type Payload = {
  trackCardViewed: () => void;
  trackCardConfirmation: () => void;
  trackCardDismiss: () => void;
};

export function useTrackingCardEvent(cardInfo: { cardName: string; cardPurpose: string }): Payload {
  const { cardName } = cardInfo;

  const trackCardViewed = () => {
    if (cardName) {
      cardEvent.cardViewed(cardInfo).catch(() => {
        logger.logError({
          reason: LOGGER.Service.GROWTHBOOK_ERROR,
          message: 'Failed to track card viewed event',
        });
      });
    }
  };

  const trackCardConfirmation = (): void => {
    if (cardName) {
      cardEvent.cardConfirmation(cardInfo).catch(() => {
        logger.logError({
          reason: LOGGER.Service.GROWTHBOOK_ERROR,
          message: 'Failed to track card confirmation event',
        });
      });
    }
  };

  const trackCardDismiss = (): void => {
    if (cardName) {
      cardEvent.cardDismiss(cardInfo).catch(() => {
        logger.logError({
          reason: LOGGER.Service.GROWTHBOOK_ERROR,
          message: 'Failed to track card dismiss event',
        });
      });
    }
  };

  return {
    trackCardViewed,
    trackCardConfirmation,
    trackCardDismiss,
  };
}

export default useTrackingCardEvent;

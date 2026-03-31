import { AWS_EVENTS } from 'constants/awsEvents';

import { EventCollection } from './EventCollection';

type CardEvent = {
  cardName: string;
  cardPurpose: string;
};

export class CardEventCollection extends EventCollection {
  cardViewed({ cardName, cardPurpose }: CardEvent): Promise<unknown> {
    const attributes = {
      cardName,
      cardPurpose,
    };
    return this.record({
      name: AWS_EVENTS.CARD.VIEWED,
      attributes,
    });
  }

  cardDismiss({ cardName, cardPurpose }: CardEvent): Promise<unknown> {
    const attributes = {
      cardName,
      cardPurpose,
    };
    return this.record({
      name: AWS_EVENTS.CARD.DISMISS,
      attributes,
    });
  }

  cardConfirmation({ cardName, cardPurpose }: CardEvent): Promise<unknown> {
    const attributes = {
      cardName,
      cardPurpose,
    };
    return this.record({
      name: AWS_EVENTS.CARD.CONFIRMATION,
      attributes,
    });
  }
}

export default new CardEventCollection();

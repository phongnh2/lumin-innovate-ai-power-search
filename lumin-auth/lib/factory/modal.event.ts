import { AWS_EVENTS } from '@/constants/awsEvents';

import analyticContainer from './analytic.container';
import { AWSAnalytics } from './aws-analytics';
import { BaseEvent } from './base.event';
import { DatadogAnalytics } from './datadog-analytics';

export type TModalEvent = {
  modalName: string;
  modalPurpose: string;
};

export class ModalEventCollection extends BaseEvent {
  getParams = ({ modalName, modalPurpose }: TModalEvent) => {
    return { modalName, modalPurpose };
  };

  modalViewed = ({ modalName, modalPurpose }: TModalEvent) => {
    return this.record({
      name: AWS_EVENTS.MODAL.VIEWED,
      attributes: this.getParams({ modalName, modalPurpose })
    });
  };

  modalDismiss({ modalName, modalPurpose }: TModalEvent) {
    return this.record({
      name: AWS_EVENTS.MODAL.DISMISS,
      attributes: this.getParams({ modalName, modalPurpose })
    });
  }

  modalConfirmation({ modalName, modalPurpose }: TModalEvent) {
    return this.record({
      name: AWS_EVENTS.MODAL.CONFIRMATION,
      attributes: this.getParams({ modalName, modalPurpose })
    });
  }

  modalHidden({ modalName, modalPurpose }: TModalEvent) {
    return this.record({
      name: AWS_EVENTS.MODAL.HIDDEN,
      attributes: this.getParams({ modalName, modalPurpose })
    });
  }
}

export const modalEvent = new ModalEventCollection(analyticContainer.get(AWSAnalytics.providerName), analyticContainer.get(DatadogAnalytics.providerName));

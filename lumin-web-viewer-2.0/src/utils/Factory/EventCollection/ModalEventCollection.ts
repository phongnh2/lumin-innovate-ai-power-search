import { AWS_EVENTS } from 'constants/awsEvents';

import { ModalPurpose } from './constants/ModalPurpose';
import { EventCollection } from './EventCollection';

type ModalAttributes = {
  modalName: string;
  modalPurpose?: string;
  variationName?: string;
};

export class ModalEventCollection extends EventCollection {
  // eslint-disable-next-line class-methods-use-this
  private getEventPurpose(modalName: string, modalPurpose?: string) {
    return modalPurpose || ModalPurpose[modalName];
  }

  private getAttributes({ modalName, modalPurpose, variationName }: ModalAttributes) {
    return {
      modalName,
      modalPurpose: this.getEventPurpose(modalName, modalPurpose),
      variationName,
    };
  }

  modalViewed({ modalName, modalPurpose, variationName }: ModalAttributes) {
    const attributes = {
      modalName,
      modalPurpose,
      variationName,
    };
    return this.record({
      name: AWS_EVENTS.MODAL.VIEWED,
      attributes: this.getAttributes(attributes),
    });
  }

  modalDismiss({ modalName, modalPurpose, variationName }: ModalAttributes) {
    const attributes = {
      modalName,
      modalPurpose,
      variationName,
    };
    return this.record({
      name: AWS_EVENTS.MODAL.DISMISS,
      attributes: this.getAttributes(attributes),
    });
  }

  modalConfirmation({ modalName, modalPurpose, variationName }: ModalAttributes) {
    const attributes = {
      modalName,
      modalPurpose,
      variationName,
    };
    return this.record({
      name: AWS_EVENTS.MODAL.CONFIRMATION,
      attributes: this.getAttributes(attributes),
    });
  }

  modalHidden({ modalName, modalPurpose, variationName }: ModalAttributes) {
    const attributes = {
      modalName,
      modalPurpose,
      variationName,
    };
    return this.record({
      name: AWS_EVENTS.MODAL.HIDDEN,
      attributes: this.getAttributes(attributes),
    });
  }
}

export default new ModalEventCollection();

export { ModalName } from './constants/ModalName';

export { ModalPurpose };

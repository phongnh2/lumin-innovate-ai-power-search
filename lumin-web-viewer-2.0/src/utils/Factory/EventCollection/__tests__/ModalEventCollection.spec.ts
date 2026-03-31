import { ModalEventCollection, ModalPurpose } from '../ModalEventCollection';
import { AWS_EVENTS } from 'constants/awsEvents';

jest.mock('../EventCollection', () => ({
  EventCollection: class {
    record = jest.fn();
  },
}));

describe('ModalEventCollection', () => {
  let collection: ModalEventCollection;

  beforeEach(() => {
    collection = new ModalEventCollection();
    jest.clearAllMocks();
  });

  const params = {
    modalName: 'TestModal',
    modalPurpose: 'Open',
    variationName: 'A',
  };

  test('modalViewed', () => {
    collection.modalViewed(params);
    expect(collection.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.MODAL.VIEWED,
      attributes: {
        modalName: 'TestModal',
        modalPurpose: 'Open',
        variationName: 'A',
      },
    });
  });

  test('modalDismiss', () => {
    collection.modalDismiss(params);
    expect(collection.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.MODAL.DISMISS,
      attributes: {
        modalName: 'TestModal',
        modalPurpose: 'Open',
        variationName: 'A',
      },
    });
  });

  test('modalConfirmation', () => {
    collection.modalConfirmation(params);
    expect(collection.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.MODAL.CONFIRMATION,
      attributes: {
        modalName: 'TestModal',
        modalPurpose: 'Open',
        variationName: 'A',
      },
    });
  });

  test('modalHidden', () => {
    collection.modalHidden(params);
    expect(collection.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.MODAL.HIDDEN,
      attributes: {
        modalName: 'TestModal',
        modalPurpose: 'Open',
        variationName: 'A',
      },
    });
  });
});

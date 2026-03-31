import { store } from 'store';
import actions from 'actions';
import LocalStorageUtils from 'utils/localStorage';
import { handlePromptEditAnnotation } from '../handlePromptEditAnnotation';
import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes } from 'constants/lumin-common';

jest.mock('store', () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

jest.mock('actions', () => ({
  openViewerModal: jest.fn((payload) => ({ type: 'OPEN_VIEWER_MODAL', payload })),
}));

jest.mock('utils/localStorage', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock('i18next', () => ({
  t: jest.fn((key) => key),
}));

describe('handlePromptEditAnnotation', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should immediately confirm if the action is already in local storage prompt data', () => {
    (LocalStorageUtils.get as jest.Mock).mockReturnValue(JSON.stringify([ANNOTATION_ACTION.MODIFY]));

    handlePromptEditAnnotation({
      action: ANNOTATION_ACTION.MODIFY,
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
    });

    expect(mockOnConfirm).toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should open a warning modal if the action is NOT in local storage', () => {
    (LocalStorageUtils.get as jest.Mock).mockReturnValue(JSON.stringify([]));

    handlePromptEditAnnotation({
      action: ANNOTATION_ACTION.DELETE,
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
    });

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'OPEN_VIEWER_MODAL',
        payload: expect.objectContaining({
          type: ModalTypes.WARNING,
          onConfirm: expect.any(Function),
          onCancel: mockOnCancel,
        }),
      })
    );
  });

  it('should save preference to local storage and confirm when modal is confirmed with checkbox checked', () => {
    (LocalStorageUtils.get as jest.Mock).mockReturnValue(JSON.stringify([]));
    
    handlePromptEditAnnotation({
      action: ANNOTATION_ACTION.DELETE,
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
    });

    const openModalCall = (store.dispatch as jest.Mock).mock.calls[0][0];
    const onConfirmCallback = openModalCall.payload.onConfirm;

    // Simulate clicking confirm with checkbox checked
    onConfirmCallback(true);

    expect(LocalStorageUtils.set).toHaveBeenCalledWith({
      key: LocalStorageKey.SHOULD_HIDE_CHANGE_ANNOTATION_OF_OTHER_PEOPLE_PROMPT,
      value: JSON.stringify([ANNOTATION_ACTION.DELETE]),
    });
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should confirm but NOT save preference if checkbox is unchecked', () => {
    (LocalStorageUtils.get as jest.Mock).mockReturnValue(JSON.stringify([]));
    
    handlePromptEditAnnotation({
      action: ANNOTATION_ACTION.MODIFY,
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
    });

    const openModalCall = (store.dispatch as jest.Mock).mock.calls[0][0];
    const onConfirmCallback = openModalCall.payload.onConfirm;

    // Simulate clicking confirm with checkbox UNCHECKED
    onConfirmCallback(false);

    expect(LocalStorageUtils.set).toHaveBeenCalledWith({
      key: LocalStorageKey.SHOULD_HIDE_CHANGE_ANNOTATION_OF_OTHER_PEOPLE_PROMPT,
      value: JSON.stringify([]), // Existing data remains unchanged
    });
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should handle "common.add" translation default case', () => {
    (LocalStorageUtils.get as jest.Mock).mockReturnValue(JSON.stringify([]));

    // Passing a type that falls into default switch case (though strict typing might block this in real TS, good for coverage)
    handlePromptEditAnnotation({
      action: 'ADD' as any,
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
    });
    
    // Just verify it runs without crashing and calls dispatch
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should handle null value from localStorage and default to empty array', () => {
    (LocalStorageUtils.get as jest.Mock).mockReturnValue(null);

    handlePromptEditAnnotation({
      action: ANNOTATION_ACTION.DELETE,
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
    });

    // Since promptData defaults to [], the action is not included, so modal should open
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'OPEN_VIEWER_MODAL',
        payload: expect.objectContaining({
          type: ModalTypes.WARNING,
        }),
      })
    );
  });
});
import pLimit from 'p-limit';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useShallow } from 'zustand/react/shallow';

import core from 'core';

import { FIELD_SESSION_ID, NEW_FORM_FIELD_IN_SESSION } from 'constants/formBuildTool';

import { useFormFieldDetectionStore } from './useFormFieldDetectionStore';
import useShowModal from './useShowModal';
import { socket } from '../../../socket';
import { applyFormFieldsDetected } from '../manipulation/applyFormFieldsDetected';
import { setIsApplyingFormFieldDetection } from '../slice';
import { IFormFieldDetectionResult } from '../types/detectionField.type';

const limitPromise = pLimit(1);

const useSetupDetectionResult = () => {
  const { currentSessionId, setDetectionData } = useFormFieldDetectionStore(
    useShallow((state) => ({
      currentSessionId: state.currentSessionId,
      setDetectionData: state.setDetectionData,
    }))
  );

  const dispatch = useDispatch();
  const { showLoadingModal } = useShowModal();

  const handleSetupDetectionResult = useCallback(
    async (
      { sessionId, socketMessage }: { sessionId: string; socketMessage: string },
      options: { signal?: AbortSignal } = {}
    ) => {
      await new Promise((resolve: (value: number) => void, reject: (error: Error) => void) => {
        const onFormFieldDetectionCompleted = async ({ predictions, status }: IFormFieldDetectionResult) => {
          try {
            if (status.errorCode || !predictions.length) {
              throw new Error('Can not detect form fields');
            }
            dispatch(setIsApplyingFormFieldDetection(true));
            showLoadingModal({ currentStep: 1, isCancelable: false });
            if (!currentSessionId) {
              const annotations = core.getAnnotationsList();
              annotations.forEach((annot) => {
                const fieldSessionId = annot.getCustomData(FIELD_SESSION_ID);
                const isNewFormFieldInSesion = annot.getCustomData(NEW_FORM_FIELD_IN_SESSION);
                if (isNewFormFieldInSesion && !fieldSessionId) {
                  annot.setCustomData(FIELD_SESSION_ID, sessionId);
                }
              });
            }
            await applyFormFieldsDetected({ sessionId, predictions });
            // TODO: temporary disable due to AI server not ready to receive data
            // setDetectionData({ sessionId, predictions });
            resolve(1);
          } catch (error: unknown) {
            reject(new Error('Failed to apply detected form fields', { cause: error }));
          } finally {
            socket.removeListener({ message: socketMessage });
          }
        };

        socket.on(socketMessage, (data: IFormFieldDetectionResult) =>
          limitPromise(onFormFieldDetectionCompleted, data)
        );

        options.signal?.addEventListener(
          'abort',
          () => {
            socket.removeListener({ message: socketMessage });
            resolve(1);
          },
          { once: true }
        );
      });
    },
    [currentSessionId, dispatch, setDetectionData, showLoadingModal]
  );

  return { handleSetupDetectionResult };
};

export default useSetupDetectionResult;

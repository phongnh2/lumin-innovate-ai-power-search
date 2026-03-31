import { useDispatch, useSelector } from 'react-redux';

import { useCleanup } from 'hooks/useCleanup';

import { closeFeedbackForm, feedbackFormSelector } from 'features/MultistepFeedbackForm/slice';

export const useCloseMultiFeedbackForm = () => {
  const isFeedbackFormEnabled = useSelector(feedbackFormSelector.isEnabled);
  const dispatch = useDispatch();
  useCleanup(() => {
    if (isFeedbackFormEnabled) {
      dispatch(closeFeedbackForm());
    }
  }, [isFeedbackFormEnabled]);
};

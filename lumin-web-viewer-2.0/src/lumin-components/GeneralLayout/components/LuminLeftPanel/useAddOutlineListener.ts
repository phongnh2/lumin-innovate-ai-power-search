import { useEffect } from 'react';
import { batch, useDispatch } from 'react-redux';

import actions from 'actions';

import { useOutlineTreeContext } from 'features/Outline/contexts/Outline.context';
import { OutlineEvent } from 'features/Outline/types';

import { CUSTOM_EVENT } from 'constants/customEvent';

export const useAddOutlineListener = () => {
  const dispatch = useDispatch();
  const { setDefaultOutline } = useOutlineTreeContext();

  useEffect(() => {
    const onOpenOutlinePanel = (e: CustomEvent<{ pageNumber?: number; textContent?: string }>) => {
      const { pageNumber, textContent } = e.detail;
      batch(() => {
        dispatch(actions.openOutlinePanel());
        dispatch(actions.setOutlineEvent(OutlineEvent.ADD));
        setDefaultOutline({ pageNumber, textContent });
      });
    };
    window.addEventListener(CUSTOM_EVENT.OPEN_OUTLINE_PANEL, onOpenOutlinePanel);
    return () => {
      window.removeEventListener(CUSTOM_EVENT.OPEN_OUTLINE_PANEL, onOpenOutlinePanel);
    };
  }, []);
};

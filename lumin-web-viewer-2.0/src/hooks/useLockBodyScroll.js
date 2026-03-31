import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';
import { useContext, useEffect } from 'react';
import { useLockBodyScroll as useLockBodyScrollBase } from 'react-use';

export const useLockBodyScroll = (locked) => {
  const { bodyScrollRef } = useContext(AppLayoutContext);
  useLockBodyScrollBase(locked);

  useEffect(() => {
    if (bodyScrollRef.current) {
      bodyScrollRef.current.style.overflowY = locked ? 'hidden' : null;
    }
  }, [locked, bodyScrollRef]);
};

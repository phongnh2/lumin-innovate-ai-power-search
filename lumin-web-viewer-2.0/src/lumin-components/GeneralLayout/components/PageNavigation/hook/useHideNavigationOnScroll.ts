import { useEffect, useRef } from 'react';
import { useScrolling } from 'react-use';

interface UseHideNavigationOnScrollProps {
  setActive: (value: boolean) => void;
  onMouseLeave: () => void;
}

export const useHideNavigationOnScroll = ({ setActive, onMouseLeave }: UseHideNavigationOnScrollProps) => {
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current = document.getElementById('DocumentContainer');
  }, []);

  const scrolling = useScrolling(scrollRef);

  useEffect(() => {
    if (scrolling) {
      setActive(true);
      return;
    }
    onMouseLeave();
  }, [scrolling]);
};

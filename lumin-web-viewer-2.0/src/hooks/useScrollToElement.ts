import React, { useEffect, useRef } from 'react';

type UseScrollToElementProps = {
  scrollOptions: ScrollIntoViewOptions;
  scrollToElement: boolean;
};

type UseScrollToElementData = {
  elementRef: React.MutableRefObject<HTMLDivElement>;
};

const useScrollToElement = ({ scrollToElement, scrollOptions }: UseScrollToElementProps): UseScrollToElementData => {
  const elementRef = useRef<HTMLDivElement>();
  const scrolled = useRef(false);

  useEffect(() => {
    if (!scrollToElement) {
      scrolled.current = false;
    }
  }, [scrollToElement]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const highlightElement = elementRef.current;
      if (!highlightElement || !scrollToElement || scrolled.current) return;

      highlightElement.scrollIntoView(scrollOptions);
      scrolled.current = true;
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [scrollOptions, scrollToElement, scrolled]);

  return { elementRef };
};

export default useScrollToElement;

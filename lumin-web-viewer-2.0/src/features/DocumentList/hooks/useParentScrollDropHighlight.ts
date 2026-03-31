import { useEffect, useRef, useState } from 'react';

type UseParentScrollDropHighlightProps = {
  enabled: boolean;
};

const useParentScrollDropHighlight = <T extends HTMLElement, C extends HTMLElement>({
  enabled,
}: UseParentScrollDropHighlightProps) => {
  const [showDropHightlight, setShowDropHightlight] = useState(false);
  const triggerElementRef = useRef<T | null>(null);
  const bindToElementRef = useRef<C | null>(null);
  const [dropHighlightElementStyle, setDropHighlightElementStyle] = useState<React.CSSProperties>({});

  const createDropHighlightElementStyle = (boundingClientRect: DOMRectReadOnly) => {
    const { x, y, width } = boundingClientRect;
    const height = `calc(100vh - ${y}px)`;
    return {
      position: 'fixed',
      top: y,
      left: x,
      width,
      height,
    } as React.CSSProperties;
  };

  useEffect(() => {
    const triggerElement = triggerElementRef.current;
    if (!enabled || !triggerElement) return undefined;

    const observer = new IntersectionObserver(([entry]) => setShowDropHightlight(entry.intersectionRatio < 1), {
      threshold: 1,
      rootMargin: '-1px 0px 0px 0px',
    });
    observer.observe(triggerElement);

    return () => {
      observer.unobserve(triggerElement);
    };
  }, [enabled, triggerElementRef]);

  useEffect(() => {
    const bindToElement = bindToElementRef.current;
    if (!enabled || !bindToElement || !showDropHightlight) return undefined;

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const style = createDropHighlightElementStyle(entry.boundingClientRect);
        setDropHighlightElementStyle(style);
      },
      {
        threshold: 1,
      }
    );

    const resizeObserver = new ResizeObserver(() => {
      intersectionObserver.disconnect(); // Reset the IntersectionObserver
      intersectionObserver.observe(bindToElement); // Re-observe after resizing
    });

    intersectionObserver.observe(bindToElement);
    resizeObserver.observe(bindToElement);

    return () => {
      intersectionObserver.unobserve(bindToElement);
      resizeObserver.unobserve(bindToElement);
    };
  }, [enabled, bindToElementRef, showDropHightlight]);

  return {
    showDropHightlight,
    dropHighlightElementStyle,
    triggerElementRef,
    bindToElementRef,
  };
};

export default useParentScrollDropHighlight;

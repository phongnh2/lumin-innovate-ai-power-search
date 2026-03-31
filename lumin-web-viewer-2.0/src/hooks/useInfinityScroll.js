import { useEffect, useRef, useState } from 'react';

export const useInfinityScroll = ({
  executer,
}) => {
  const [lastElement, setLastElement] = useState(null);

  const observer = useRef(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          executer();
        }
      },
    );
  }, [executer]);

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElement]);

  return {
    setLastElement,
  };
};

import { useEffect } from 'react';

const SCROLL_DIRECTION = {
  UP: -1,
  DOWN: 1,
};

export default function useBoundingScroll(element) {
  useEffect(() => {
    const bindScroll = (event) => {
      const { deltaY } = event;
      if (!element) {
        return;
      }
      const { scrollHeight, clientHeight, scrollTop } = element;
      const direction = deltaY > 0 ? SCROLL_DIRECTION.DOWN : SCROLL_DIRECTION.UP;

      const isBeginningReached = !scrollTop && direction === SCROLL_DIRECTION.UP;
      const isEndingReached = scrollHeight === (clientHeight + scrollTop) && direction === SCROLL_DIRECTION.DOWN;
      if (
        (isBeginningReached && direction === SCROLL_DIRECTION.UP) ||
        (isEndingReached && direction === SCROLL_DIRECTION.DOWN)
      ) {
        event.preventDefault();
      }
    };
    if (element) {
      element.addEventListener('wheel', bindScroll);
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', bindScroll);
      }
    };
  }, [element]);
}

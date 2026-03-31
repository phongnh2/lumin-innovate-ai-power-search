import { debounce } from 'lodash';
import { RefObject, useEffect, useState } from 'react';

const WINDOW_SIZE_DEBOUNCED_TIME = 300;

interface IProps {
  googleContainerRef: RefObject<HTMLDivElement>;
  isGsiLoaded?: boolean;
}

const useGoogleButtonWidth = ({ googleContainerRef, isGsiLoaded }: IProps) => {
  const [buttonWidth, setButtonWidth] = useState(googleContainerRef.current?.clientWidth);

  useEffect(() => {
    setButtonWidth(googleContainerRef.current?.clientWidth);
    const onWindowResize = debounce(() => {
      setButtonWidth(googleContainerRef.current?.clientWidth);
    }, WINDOW_SIZE_DEBOUNCED_TIME);

    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, [isGsiLoaded]);

  return { buttonWidth };
};

export default useGoogleButtonWidth;

import classNames from 'classnames';
import throttle from 'lodash/throttle';
import { Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'hooks';

import styles from './BackToTop.module.scss';

export type BackToTopClassNames = {
  container?: string;
};

interface BackToTopProps {
  onClick: () => void;
  scrollerRef?: HTMLElement | Window;
  classNames?: BackToTopClassNames;
}

const THROTTLE_TIME = 100;
// 5s delay before automatically hiding the button after scrolling up stops
const BUTTON_AUTO_HIDE_TIMEOUT = 5000;

const BackToTop = ({ onClick, scrollerRef, classNames: extraClassNames }: BackToTopProps) => {
  const { t } = useTranslation();

  const [show, setShow] = useState(false);
  const lastScrollYRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useMemo(
    () =>
      throttle((event: Event) => {
        const target = event.target as HTMLElement;
        const scrollY = target.scrollTop;
        setShow(Boolean(scrollY) && scrollY < lastScrollYRef.current);
        lastScrollYRef.current = scrollY;
      }, THROTTLE_TIME),
    []
  );

  useEffect(() => {
    if (!show) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, BUTTON_AUTO_HIDE_TIMEOUT);
  }, [show]);

  useEffect(() => {
    scrollerRef?.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollerRef?.removeEventListener('scroll', handleScroll);
  }, [scrollerRef, handleScroll]);

  return (
    <div className={classNames(styles.container, extraClassNames?.container, { [styles.show]: show })}>
      <Button
        size="lg"
        startIcon={<Icomoon type="arrow-narrow-up-lg" size="lg" />}
        classNames={{
          root: styles.button,
        }}
        onClick={onClick}
      >
        <span className={styles.label}>{t('common.backToTop')}</span>
      </Button>
    </div>
  );
};

export default React.memo(BackToTop);

import React, { useEffect } from 'react';

import { eventTracking } from 'utils';

import { AWS_EVENTS } from 'constants/awsEvents';

type Props = {
  elementRef: React.RefObject<HTMLDivElement>;
  notificationName: string;
};

export const useTrackingNotificationsEvent = (props: Props): void => {
  const { elementRef, notificationName } = props;

  useEffect(() => {
    let observerRefValue = null as Element;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          eventTracking(AWS_EVENTS.NOTIFICATION.VIEWED, { notificationName }).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
      observerRefValue = elementRef.current;
    }
    return () => {
      if (observerRefValue) {
        observer.unobserve(observerRefValue);
      }
    };
  }, []);
};

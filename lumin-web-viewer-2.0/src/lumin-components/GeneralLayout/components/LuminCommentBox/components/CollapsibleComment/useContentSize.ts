import { useEffect, useRef, useState, useCallback } from 'react';

import { HEIGHT_CHANGE_THRESHOLD } from '@new-ui/constants';

import useLatestRef from 'hooks/useLatestRef';

import { COMMENT_CONTENT_MAX_HEIGHT } from './CollapsibleComment.styled';

export enum ContentStatus {
  Initial = 'initial',
  Filled = 'filled',
  Collapsed = 'collapsed',
}

interface IProps {
  annotation: Core.Annotations.Annotation;
}

const useContentSize = ({ annotation }: IProps) => {
  const [contentDisplay, setContentDisplay] = useState(ContentStatus.Initial);
  const contentDisplayRef = useLatestRef(contentDisplay);
  const contentRef = useRef<HTMLDivElement>(null);

  const determineContentStatus = useCallback((height: number): ContentStatus => {
    if (height === 0) {
      return ContentStatus.Initial;
    }
    if (height > COMMENT_CONTENT_MAX_HEIGHT) {
      return ContentStatus.Collapsed;
    }
    return ContentStatus.Filled;
  }, []);

  useEffect(() => {
    if (!contentRef.current || contentDisplayRef.current !== ContentStatus.Initial) {
      return undefined;
    }

    let prevHeight = 0;

    const observer = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        if (
          !contentRef.current ||
          !(contentDisplayRef.current === ContentStatus.Initial ||
            annotation instanceof window.Core.Annotations.FreeTextAnnotation
          )
        ) {
          return;
        }

        const { scrollHeight } = entries[0].target;

        if (Math.abs(scrollHeight - prevHeight) > HEIGHT_CHANGE_THRESHOLD) {
          prevHeight = scrollHeight;
          const newStatus = determineContentStatus(scrollHeight);
          setContentDisplay(newStatus);
        }
      });
    });

    observer.observe(contentRef.current);

    return () => {
      observer.disconnect();
    };
  }, [contentDisplayRef, annotation, determineContentStatus]);

  return {
    contentRef,
    contentDisplay,
  };
};

export default useContentSize;

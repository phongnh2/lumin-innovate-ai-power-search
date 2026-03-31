import { useEffect, useLayoutEffect, useRef } from 'react';
import { VirtuosoHandle } from 'react-virtuoso';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

type UseScrollToNewUploadedDocumentProps = {
  folders: IFolder[];
  documents: IDocumentBase[];
  scrollToElement: boolean;
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>;
};

const SCROLL_TO_ELEMENT_TIMEOUT = 100; // ms

const useScrollToNewUploadedDocument = ({
  virtuosoRef,
  scrollToElement,
  folders,
  documents,
}: UseScrollToNewUploadedDocumentProps) => {
  const scrolled = useRef(false);

  useLayoutEffect(() => {
    if (!scrollToElement) {
      scrolled.current = false;
    }
  }, [scrollToElement]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!documents.length || !virtuosoRef.current || !scrollToElement || scrolled.current) return;
      virtuosoRef.current.scrollToIndex({
        index: folders.length,
        align: 'center',
        behavior: 'smooth',
      });
      scrolled.current = true;
    }, SCROLL_TO_ELEMENT_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [scrollToElement, documents.length, folders.length]);
};

export default useScrollToNewUploadedDocument;

import classNames from 'classnames';
import { cssVar } from 'polished';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle, VirtuosoProps } from 'react-virtuoso';

import { withDocumentModal, withOpenDocDecorator } from 'luminComponents/DocumentList/HOC';
import { ExtendedDocumentModalProps } from 'luminComponents/DocumentList/HOC/withDocumentModal';
import UploadDropZone, { UploadDropZoneContext } from 'luminComponents/UploadDropZone';

import withFolderModal, { ExtendedFolderModalProps } from 'features/DocumentList/HOC/withFolderModal';
import useDocumentListSubscription from 'features/DocumentList/hooks/useDocumentListSubscription';
import useParentScrollDropHighlight from 'features/DocumentList/hooks/useParentScrollDropHighlight';
import { SubscriptionFunctionParams } from 'features/DocumentList/types';

import { TOTAL_DOCUMENT_DUMMY } from 'constants/documentConstants';

import { BackToTop, BackToTopClassNames } from '../BackToTop';

import styles from './DocumentList.module.scss';

type DocumentListContextType = {
  isLoading: boolean;
  isFetchingMore: boolean;
};

type DocumentListClassNames = {
  backToTop: BackToTopClassNames;
  header: string;
  listContainer: string;
  container: string;
  dragAndDropSvg: string;
};

type DocumentListElements = {
  skeletonElement: React.ReactElement;
  emptyElement?: React.ReactElement;
  headerElement?: React.ReactElement;
};

export interface DocumentListProps<T> extends ExtendedDocumentModalProps, ExtendedFolderModalProps {
  isLoading: boolean;
  documents: T[];
  refetchDocument: () => void;
  renderItem: (
    index: number,
    itemData: T,
    refetchDocument: () => void,
    openDocumentModal: ExtendedDocumentModalProps['openDocumentModal'],
    openFolderModal: ExtendedFolderModalProps['openFolderModal']
  ) => React.JSX.Element;
  elements: DocumentListElements;
  isBackToTop?: boolean;
  fetchMore: (setLoading?: (value: boolean) => void) => Promise<void>;
  onSubscription?: (params: SubscriptionFunctionParams) => void;
  parentScrollerRef?: HTMLElement;
  classNames?: Partial<DocumentListClassNames>;
  dropFileDisabled?: boolean;
  virtuosoProps?: Partial<VirtuosoProps<T, DocumentListContextType>>;
}

const DocumentList = <T,>(props: DocumentListProps<T>) => {
  const {
    isLoading,
    documents,
    openDocumentModal,
    refetchDocument,
    renderItem,
    elements,
    isBackToTop,
    fetchMore,
    onSubscription,
    parentScrollerRef,
    classNames: extraClassNames,
    dropFileDisabled,
    openFolderModal,
    virtuosoProps,
  } = props;

  const listRef = useRef<HTMLDivElement>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const onFetchMore = useCallback(() => fetchMore((value) => setIsFetchingMore(value)), [fetchMore]);

  const listContext = useMemo(
    () => ({ isLoading, isFetchingMore } as DocumentListContextType),
    [isLoading, isFetchingMore]
  );

  const renderItemContent = useCallback(
    (index: number, itemData: T) => renderItem(index, itemData, refetchDocument, openDocumentModal, openFolderModal),
    [renderItem, refetchDocument, openDocumentModal, openFolderModal]
  );

  const renderSkeleton = () => {
    const dummies = Array(TOTAL_DOCUMENT_DUMMY).fill(0);
    return dummies.map((_, idx) => <div key={idx}>{elements.skeletonElement}</div>);
  };

  const listScrollParent = useMemo(() => parentScrollerRef || (listRef.current ?? undefined), [parentScrollerRef]);

  const renderList = () =>
    isLoading ? (
      renderSkeleton()
    ) : (
      <Virtuoso
        {...virtuosoProps}
        ref={virtuosoRef}
        fixedItemHeight={49}
        context={listContext}
        data={documents}
        itemContent={renderItemContent}
        endReached={onFetchMore}
        customScrollParent={listScrollParent}
        components={{
          Footer: ({ context }) => (context?.isFetchingMore ? elements.skeletonElement : null),
        }}
      />
    );

  const shouldRenderEmptyState = useMemo(() => !isLoading && !documents.length, [documents.length, isLoading]);

  const handleBackToTop = () => {
    if (parentScrollerRef) {
      parentScrollerRef.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ index: 0, align: 'start', behavior: 'smooth' });
    }
  };

  // subscription
  useDocumentListSubscription({ onSubscription });

  const {
    showDropHightlight: showParentScrollDropHightlight,
    dropHighlightElementStyle: parentScrollDropHighlightElementStyle,
    triggerElementRef,
    bindToElementRef,
  } = useParentScrollDropHighlight<HTMLDivElement, HTMLDivElement>({
    enabled: Boolean(parentScrollerRef) && !dropFileDisabled,
  });

  const renderDropFileHighlight = (showHighlight: boolean, showParentScrollHighlight?: boolean) => (
    <svg
      className={classNames(
        styles.dragAndDropSvg,
        {
          [styles.show]: showHighlight,
          [styles.parentScroll]: showParentScrollHighlight,
        },
        extraClassNames?.dragAndDropSvg
      )}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="100%"
        height="100%"
        fill="none"
        strokeDasharray="6"
        strokeDashoffset="0"
        strokeLinecap="square"
        rx={cssVar('--kiwi-border-radius-md', 8)}
        className={styles.dragAndDropBorder}
      />
    </svg>
  );

  if (shouldRenderEmptyState && !elements.emptyElement) {
    return null;
  }

  return (
    <>
      <div className={styles.triggerParentScrollDropHighlight} ref={triggerElementRef} />
      <UploadDropZone highlight disabled={isLoading || dropFileDisabled}>
        <UploadDropZoneContext.Consumer>
          {({ showHighlight }) => (
            <div className={classNames(styles.container, extraClassNames?.container)}>
              {shouldRenderEmptyState ? (
                elements.emptyElement
              ) : (
                <div
                  className={classNames(styles.listContainer, extraClassNames?.listContainer, {
                    [styles.showHighlight]: showHighlight,
                  })}
                >
                  {!showParentScrollDropHightlight && renderDropFileHighlight(showHighlight)}
                  {elements.headerElement && (
                    // `holder` class for StickyService (if used)
                    <div
                      className={classNames(
                        styles.listHeaderWrapper,
                        'holder',
                        {
                          [styles.showHighlight]: showHighlight,
                          [styles.parentScroll]: showParentScrollDropHightlight,
                          [styles.noDropFile]: dropFileDisabled,
                        },
                        extraClassNames?.header
                      )}
                      ref={bindToElementRef}
                    >
                      {elements.headerElement}
                    </div>
                  )}
                  {renderList()}
                  {isBackToTop && (
                    <BackToTop
                      onClick={handleBackToTop}
                      scrollerRef={listScrollParent}
                      classNames={extraClassNames?.backToTop}
                    />
                  )}
                  {showParentScrollDropHightlight && (
                    <div style={parentScrollDropHighlightElementStyle}>
                      {renderDropFileHighlight(showHighlight, showParentScrollDropHightlight)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </UploadDropZoneContext.Consumer>
      </UploadDropZone>
    </>
  );
};

export default withDocumentModal(withOpenDocDecorator(withFolderModal(DocumentList)));

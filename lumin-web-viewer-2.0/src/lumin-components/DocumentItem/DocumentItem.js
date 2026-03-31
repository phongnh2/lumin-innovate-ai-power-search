import dayjs from 'dayjs';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import ButtonMore from 'lumin-components/ButtonMore';
import usePrefetchMoreOptions from 'lumin-components/Document/hooks/usePrefetchMoreOptions';
import { DocumentGridItem } from 'luminComponents/ReskinLayout/components/DocumentGridItem';
import { DocumentListItem } from 'luminComponents/ReskinLayout/components/DocumentListItem';

import { bytesToSize, dateUtil } from 'utils';

import { layoutType } from 'constants/documentConstants';
import { StorageLogoMapping } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import withRightClickDocument from '../../HOC/withRightClickDocument';

const propTypes = {
  document: PropTypes.object.isRequired,
  contentPopper: PropTypes.func.isRequired,
  isDisabled: PropTypes.exact({
    selection: PropTypes.bool.isRequired,
    open: PropTypes.bool.isRequired,
    actions: PropTypes.bool.isRequired,
    drag: PropTypes.bool.isRequired,
  }).isRequired,
  type: PropTypes.oneOf([layoutType.list, layoutType.grid]).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
  onClickDocument: PropTypes.func.isRequired,
  dragRef: PropTypes.func.isRequired,
  isStarred: PropTypes.bool.isRequired,
  renderMenuActions: PropTypes.func,
  onShareItemClick: PropTypes.func,
  onCopyShareLink: PropTypes.func,
  foundDocumentScrolling: PropTypes.bool,
};

const getOverTimeTitle = (yearOffset) => `Over ${yearOffset} year${yearOffset > 1 ? 's' : ''}`;

const DocumentItem = (props) => {
  const {
    type,
    document,
    contentPopper,
    isDisabled,
    isSelected,
    onCheckboxChange,
    onClickDocument,
    dragRef,
    isStarred,
    renderMenuActions,
    renderQuickActions,
    foundDocumentScrolling,
  } = props;
  const { createdAt, lastAccess, size, isOverTimeLimit } = document;
  const { prefetchOptions } = usePrefetchMoreOptions();

  const buttonMore = useMemo(
    () => (
      <div data-button-more-id={document._id}>
        <ButtonMore
          onMouseEnter={prefetchOptions}
          contentPopper={contentPopper}
          isDisabled={isDisabled.actions}
          hoverColor={Colors.PRIMARY_20}
        />
      </div>
    ),
    [contentPopper, prefetchOptions, isDisabled.actions]
  );

  const documentInterceptor = useMemo(
    () =>
      produce(document, (draftState) => {
        draftState.lastAccess = dateUtil.formatMDYTime(Number(lastAccess));
        draftState.size = bytesToSize(size);
        if (isOverTimeLimit) {
          const yearOffset = dayjs().diff(dayjs(Number(createdAt)), 'years');
          draftState.overTimeLimit = {
            hasOver: true,
            title: getOverTimeTitle(yearOffset),
          };
        }
      }),
    [document, lastAccess, isOverTimeLimit, createdAt, size]
  );

  const propsInterceptor = {
    document: documentInterceptor,
    buttonMore,
    contentPopper,
    storageLogo: StorageLogoMapping[document.service],
    isSelected,
    isDisabled,
    onOpenDocument: () => {
      !isDisabled.open && onClickDocument();
    },
    onCheckboxChange,
    dragRef,
    isStarred,
    renderMenuActions,
    renderQuickActions,
    foundDocumentScrolling,
  };

  const renderDocumentItem = () =>
    ({
      [layoutType.list]: <DocumentListItem {...propsInterceptor} />,
      [layoutType.grid]: <DocumentGridItem {...propsInterceptor} />,
    }[type]);

  return renderDocumentItem();
};

DocumentItem.propTypes = propTypes;

export default withRightClickDocument(React.memo(DocumentItem));

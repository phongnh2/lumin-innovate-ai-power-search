import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import { withOpenDocDecorator } from 'luminComponents/DocumentList/HOC';

import { useTranslation } from 'hooks';

import UploadingItem from '../UploadingItem';

import * as Styled from './UploadingBoxBody.styled';

const propTypes = {
  queue: PropTypes.array,
  isCollapse: PropTypes.bool.isRequired,
  numOfRemaining: PropTypes.number.isRequired,
};

const defaultProps = {
  queue: [],
};

const HEADER_HEIGHT = 44;
function UploadingBoxBody({
  queue,
  isCollapse,
  numOfRemaining,
}) {
  const [containerHeight, setContainerHeight] = useState(null);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const cancelAll = () => {
    dispatch(actions.cancelAllUploadingFiles());
  };
  const onCancel = (groupId) => dispatch(actions.cancelUploadFile(groupId));
  const onRetry = (groupId) => dispatch(actions.retryUploadFile(groupId));

  useEffect(() => {
    const headerHeight = numOfRemaining > 0 ? HEADER_HEIGHT : 0;
    setContainerHeight(280 + headerHeight);
  }, [numOfRemaining]);

  return (
    <>
      <Styled.Header
        isDisplay={Boolean(numOfRemaining)}
      >
        <h6>{t('uploadPopup.fileRemaining', { numOfRemaining })}</h6>
        <Styled.CancelButton
          onClick={cancelAll}
        >
          {t('uploadPopup.cancelUpload')}
        </Styled.CancelButton>
      </Styled.Header>
      <Styled.Container
        $isCollapse={isCollapse}
        $containerHeight={containerHeight}
        className="custom-scrollbar-reskin"
      >
        {queue.map((groupId) => (
          <UploadingItem
            key={groupId}
            groupId={groupId}
            onCancel={onCancel}
            onRetry={onRetry}
          />
        ))}
      </Styled.Container>
    </>
  );
}

UploadingBoxBody.propTypes = propTypes;
UploadingBoxBody.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  const { uploading } = selectors.getUploadingDocumentsStat(state);
  return {
    numOfRemaining: uploading,
    queue: selectors.getUploadBoxQueue(state),
  };
};

export default compose(connect(mapStateToProps), withOpenDocDecorator)(React.memo(UploadingBoxBody));

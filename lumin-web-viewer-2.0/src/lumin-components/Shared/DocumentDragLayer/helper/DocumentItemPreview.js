import classNames from 'classnames';
import { Avatar, Paper, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import UploadingAvatar from 'assets/lumin-svgs/uploading-thumbnail.svg';

import { useEnableWebReskin } from 'hooks';

import { getFileService } from 'utils';

import * as Styled from './DocumentItemPreview.styled';

import styles from './DocumentItemPreview.module.scss';

const DocumentItemPreview = ({ document, countFileMove }) => {
  const { isEnableReskin } = useEnableWebReskin();
  if (isEnableReskin) {
    return (
      <Paper shadow="sm" radius="md" className={classNames(styles.baseItem, styles.container)}>
        <Text type="label" size="xs" data-enabled={countFileMove > 1} className={styles.totalItems}>
          {countFileMove}
        </Text>
        <Avatar
          src={document.thumbnail ? getFileService.getThumbnailUrl(document.thumbnail) : UploadingAvatar}
          placeholder={<img src={UploadingAvatar} alt="uploading avatar" />}
          size="sm"
          radius="sm"
          variant="outline"
        />
        <Text type="title" size="sm" ellipsis>
          {document.name}
        </Text>
        {countFileMove > 1 && <Paper shadow="sm" radius="md" className={classNames(styles.baseItem, styles.layer)} />}
      </Paper>
    );
  }
  return (
    <Styled.DragPreviewContainer>
      <Styled.CountItemMove countFileMove={countFileMove}>{countFileMove}</Styled.CountItemMove>
      <Styled.ImgContainer>
        <Styled.DragPreviewImage src={getFileService.getThumbnailUrl(document.thumbnail)} />
      </Styled.ImgContainer>
      <Styled.NameWrapper>{document.name}</Styled.NameWrapper>
      {countFileMove > 1 && <Styled.DocumentLayer />}
    </Styled.DragPreviewContainer>
  );
};
DocumentItemPreview.propTypes = {
  document: PropTypes.object,
  countFileMove: PropTypes.number,
};
DocumentItemPreview.defaultProps = {
  document: {},
  countFileMove: 1,
};
export default DocumentItemPreview;

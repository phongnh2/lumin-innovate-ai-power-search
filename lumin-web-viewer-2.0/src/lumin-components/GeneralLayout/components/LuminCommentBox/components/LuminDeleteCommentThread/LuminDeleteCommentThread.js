import PropTypes from 'prop-types';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import * as Styled from './LuminDeleteCommentThread.styled';

LuminDeleteCommentThread.propTypes = {
  onCancelDelete: PropTypes.func.isRequired,
  onDeleteThread: PropTypes.func.isRequired,
  isCommentAnnotation: PropTypes.bool.isRequired,
};

function LuminDeleteCommentThread({ onCancelDelete, onDeleteThread, isCommentAnnotation }) {
  const { t } = useTranslation();

  return (
    <Styled.Container>
      <Styled.Wrapper data-cy="delete_comment_thread">
        {t(isCommentAnnotation ? 'viewer.noteContent.deleteCommentThread' : 'viewer.noteContent.deleteNote')}
        <Styled.WrapperButtons>
          <Styled.Button onClick={onCancelDelete} variant="outlined" size="md" fullWidth>
            {t('common.cancel')}
          </Styled.Button>
          <Styled.Button onClick={onDeleteThread} variant="filled" size="md" fullWidth>
            {t('common.delete')}
          </Styled.Button>
        </Styled.WrapperButtons>
      </Styled.Wrapper>
    </Styled.Container>
  );
}

export default LuminDeleteCommentThread;

import React from 'react';
import { useTheme } from 'styled-components';

import Paper from '@new-ui/general-components/Paper';

import core from 'core';
import selectors from 'selectors';

import MaterialAvatar from 'luminComponents/MaterialAvatar';

import { useTranslation } from 'hooks';
import useShallowSelector from 'hooks/useShallowSelector';

import { avatar } from 'utils';

import { useCommentContentState, useGetCommentInfo } from 'features/Comments/hooks';
import { getAllUserAvatarsOfComment } from 'features/Comments/utils';

import * as Styled from './PreviewComment.styled';

interface IProps {
  annotation: Core.Annotations.StickyAnnotation;
  closeOverlay: () => void;
}

const PreviewComment = ({ annotation, closeOverlay }: IProps) => {
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const theme = useTheme() as Record<string, string>;
  const { t } = useTranslation();
  const { name, createdDate } = useGetCommentInfo({ annotation, currentUser });
  const { content } = useCommentContentState({ annotation, currentUser });

  const avatars = getAllUserAvatarsOfComment(annotation, currentUser);
  const displayAvatars = avatars.slice(0, 5);
  const overflowCount = Math.max(avatars.length - 5, 0);
  const replyCount = annotation.getReplies().length;

  const handleOpenCommentBox = () => {
    core.deselectAllAnnotations();
    core.selectAnnotation(annotation);
  };

  return (
    <Styled.Container onMouseLeave={closeOverlay} onClick={handleOpenCommentBox}>
      <Paper elevation={2} rounded="large">
        <Styled.Wrapper>
          <Styled.Header>
            <Styled.AvatarWrapper>
              {displayAvatars.map(({ avatarRemoteId, name: commentAuthor }) => (
                <MaterialAvatar
                  key={commentAuthor}
                  size={24}
                  src={avatar.getAvatar(avatarRemoteId)}
                  style={{
                    border: `1px solid ${theme.le_main_outline_variant}`,
                  }}
                >
                  {avatar.getTextAvatar(commentAuthor)}
                </MaterialAvatar>
              ))}
              {Boolean(overflowCount) && (
                <MaterialAvatar
                  size={24}
                  style={{
                    border: `1px solid ${theme.le_main_outline_variant}`,
                    backgroundColor: theme.le_main_surface_container_highest,
                    color: theme.le_main_on_surface,
                  }}
                >
                  +{overflowCount}
                </MaterialAvatar>
              )}
            </Styled.AvatarWrapper>
            <Styled.Name>{name || t('viewer.noteContent.unknownUser')}</Styled.Name>
            <Styled.CreatedDate>{createdDate}</Styled.CreatedDate>
          </Styled.Header>
          <Styled.Content>{content}</Styled.Content>
          {Boolean(replyCount) && (
            <Styled.ReplyCount>{t('message.annotationReplyCount', { count: replyCount })}</Styled.ReplyCount>
          )}
        </Styled.Wrapper>
      </Paper>
    </Styled.Container>
  );
};

export default PreviewComment;

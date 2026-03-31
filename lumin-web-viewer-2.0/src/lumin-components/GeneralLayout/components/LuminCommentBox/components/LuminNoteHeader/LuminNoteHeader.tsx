import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import React, { useCallback } from 'react';
import { useTheme } from 'styled-components';
import tinycolor from 'tinycolor2';

import Tooltip from '@new-ui/general-components/Tooltip';

import core from 'core';

import { isComment } from 'lumin-components/CommentPanel/helper';
import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import Icomoon from 'lumin-components/Icomoon';
import MaterialAvatar from 'lumin-components/MaterialAvatar';
import { emitModifyParentNote } from 'lumin-components/NoteLumin/helpers';
import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { useThemeMode, useTranslation } from 'hooks';
import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';

import { avatar } from 'utils';

import { useGetCommentInfo } from 'features/Comments/hooks';

import CommentState from 'constants/commentState';
import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { mapAnnotationToKey, getDataWithKey } from 'constants/map';
import { colors } from 'constants/styles/editor';

import { LuminNoteHeaderProps } from './types';
import { useLuminCommentBoxContext } from '../../hooks';
import LuminNoteHeaderEditButton from '../LuminNoteHeaderEditButton';

import * as Styled from './LuminNoteHeader.styled';

dayjs.extend(calendar);

const ICON_COLOR = {
  LIGHT: '#f161c21',
  DARK: '#fff',
};

const LuminNoteHeader = ({
  currentDocument,
  currentUser,
  annotation,
  iconColor,
  isOffline,
  isCommentPopup,
  onClickDelete,
  onClose,
  className,
}: LuminNoteHeaderProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { isSelected = false, isResolved } = useLuminCommentBoxContext();
  const { requestAccessModalElement, withCommentPermission } = useRequestPermissionChecker({
    permissionRequest: RequestType.VIEWER,
  });
  const themeMode = useThemeMode();
  const theme = useTheme() as Record<string, string>;
  const hasContent = Boolean(annotation.getContents());
  const { t } = useTranslation();
  const { name, avatarRemoteId, createdDate } = useGetCommentInfo({ annotation, currentUser });
  const isReply: boolean = annotation.isReply();
  const isCommentAnnotation = isComment(annotation);
  const numbersOfReplies = !isReply ? annotation.getReplies().length : 0;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const didResolve = isCommentAnnotation && annotation.getState() === CommentState.Resolved.state;
  const isReplyStatus = isCommentAnnotation ? annotation.getStateModel() === 'Marked' : false;
  const keepReplyStatus = isCommentAnnotation ? annotation.getState() === CommentState.Rejected.state : false;

  const annotManager = core.getAnnotationManager();
  const withHighlightAnno = core
    .getAnnotationsList()
    .find((anno) => anno.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key) === annotation.Id);

  const setCommentResolve = async (newStatus: boolean, method = 'button'): Promise<void> => {
    if (newStatus !== didResolve) {
      await emitModifyParentNote(newStatus, annotation, withHighlightAnno, currentDocument, currentUser, isOffline);
    }

    if (newStatus) {
      annotManager.updateAnnotationState(
        annotation,
        CommentState.Resolved.state,
        'Review',
        t(CommentState.Resolved.message)
      );
    } else if (didResolve && method === 'button') {
      annotManager.updateAnnotationState(annotation, CommentState.Open.state, 'Review', t(CommentState.Open.message));
    }
  };

  const renderAnnotationIcon = useCallback(() => {
    const iconColorValue = annotation[iconColor] as Core.Annotations.Color;
    if (isReply) {
      return null;
    }
    const { icon, isKiwiIcon } = getDataWithKey(mapAnnotationToKey(annotation)) as {
      icon: string;
      isKiwiIcon: boolean;
    };

    const hasCustomColor = !!iconColorValue;
    const annotationIconStyle = (hasCustomColor
        ? {
            background: iconColorValue.toHexString(),
            color: tinycolor(iconColorValue.toHexString()).isLight() ? ICON_COLOR.LIGHT : ICON_COLOR.DARK,
          }
        : {
            background: colors.themes[themeMode].le_main_surface_variant,
            color: colors.themes[themeMode].le_main_on_surface_variant,
          });

    return (
      <Styled.IconAnnotationWrapper
        style={{ '--annotation-color': annotationIconStyle.background } as React.CSSProperties}
      >
        {isKiwiIcon ? (
          <KiwiIcomoon
            type={icon}
            style={{ '--icon-size': '10px' } as React.CSSProperties}
            color={annotationIconStyle.color}
          />
        ) : (
          <Icomoon className={icon} size={8} color={annotationIconStyle.color} />
        )}
      </Styled.IconAnnotationWrapper>
    );
  }, [annotation, iconColor, isReply, themeMode]);

  const onResolve = async (): Promise<void> => {
    await setCommentResolve(!didResolve);
  };

  const renderResolveButton = (): JSX.Element => {
    const shouldHideResolve = !isCommentAnnotation || !annotation.getContents() || !currentUser || isReply;
    if (shouldHideResolve) {
      return null;
    }

    return (
      <Styled.HeaderButton
        tooltipData={{ location: 'bottom', title: t(didResolve ? 'viewer.reOpenComment' : 'viewer.markAsResolved') }}
        icon={didResolve ? 'success' : 'check'}
        iconSize={14}
        iconColor={
          didResolve ? colors.themes[themeMode].le_main_on_surface_variant : colors.themes[themeMode].le_success_success
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        onClick={withCommentPermission(onResolve)}
      />
    );
  };

  const renderOptionals = () => {
    if (
      (isReply && !isSelected && (isReplyStatus || keepReplyStatus)) ||
      (!hasContent && annotation.Subject === AnnotationSubjectMapping.stickyNote) ||
      (isReply && isResolved)
    ) {
      return null;
    }
    return (
      <Styled.OptionalsContainer>
        {renderResolveButton()}
        <LuminNoteHeaderEditButton
          annotation={annotation}
          onClickDelete={onClickDelete}
          isCommentPopup={isCommentPopup}
        />
        {isCommentPopup && (
          <IconButton
            tooltipData={{ location: 'bottom', title: t('action.close') }}
            icon="cancel"
            iconSize={14}
            onClick={onClose}
          />
        )}
      </Styled.OptionalsContainer>
    );
  };

  return (
    <>
      {requestAccessModalElement}
      <Styled.Container className={className}>
        <Styled.DetailsContainer isReply={isReply}>
          <Styled.DetailsWrapper>
            <>
              <Styled.InfoContainer>
                <Styled.AvatarContainer>
                  <MaterialAvatar size={32} src={avatar.getAvatar(avatarRemoteId)}>
                    {avatar.getTextAvatar(name)}
                  </MaterialAvatar>
                  {renderAnnotationIcon()}
                </Styled.AvatarContainer>
                <Styled.NameContainer>
                  <Tooltip title={name}>
                    <Styled.AuthorName>{name || t('viewer.noteContent.unknownUser')}</Styled.AuthorName>
                  </Tooltip>
                  <Styled.NoteDescription>
                    {!(isCommentAnnotation && !hasContent) && (
                      <Tooltip title={createdDate}>
                        <Styled.TimeDetail>{createdDate}</Styled.TimeDetail>
                      </Tooltip>
                    )}
                    {!isReply && numbersOfReplies > 0 && (
                      <>
                        <Styled.SeparateDot />
                        <Icomoon
                          style={{ margin: '1px' }}
                          className="sm_comments"
                          size={14}
                          color={theme.le_main_on_surface_variant}
                        />
                        <Styled.ReplyCountText>{numbersOfReplies}</Styled.ReplyCountText>
                      </>
                    )}
                  </Styled.NoteDescription>
                </Styled.NameContainer>
              </Styled.InfoContainer>
              {renderOptionals()}
            </>
          </Styled.DetailsWrapper>
        </Styled.DetailsContainer>
      </Styled.Container>
    </>
  );
};

LuminNoteHeader.defaultProps = {
  isCommentPanel: false,
  isNoteHistory: false,
  isCommentPopup: false,
  onClickDelete: () => {},
};

export default LuminNoteHeader;

/* eslint-disable @typescript-eslint/no-floating-promises */
import { DownloadSimpleIcon } from '@luminpdf/icons/dist/csr/DownloadSimple';
import { PaletteIcon } from '@luminpdf/icons/dist/csr/Palette';
import { PencilSimpleIcon } from '@luminpdf/icons/dist/csr/PencilSimple';
import { TrashIcon } from '@luminpdf/icons/dist/csr/Trash';
import classNames from 'classnames';
import { Checkbox, MenuItemBase } from 'lumin-ui/kiwi-ui';
import React, { useState, useRef, useEffect } from 'react';

import IconButton from '@new-ui/general-components/IconButton';
import Popper from '@new-ui/general-components/Popper';

import core from 'core';

import AnnotationStylePopup from 'lumin-components/AnnotationStylePopup';
import { isComment } from 'lumin-components/CommentPanel/helper';

import { useTranslation } from 'hooks/useTranslation';

import exportNotesToTXT from 'helpers/exportNotesToTXT';

import CommentState from 'constants/commentState';
import { CUSTOM_DATA_COMMENT_HIGHLIGHT, CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';
import { DataElements } from 'constants/dataElement';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

import { useLuminCommentBoxContext } from '../../hooks';

import styles from './LuminNoteHeaderEditButton.module.scss';

interface LuminNoteHeaderEditButtonProps {
  currentDocument: IDocumentBase;
  currentUser: IUser | null;
  annotation: Core.Annotations.StickyAnnotation;
  isDisabledPopup?: boolean;
  isDisabledEdit?: boolean;
  isDisabledDelete?: boolean;
  setIsNotOwnerComment?: (value: boolean) => void;
  enableElement: (element: string) => void;
  disableElement: (element: string) => void;
  onClickDelete?: () => void;
  isShowCheckBox?: boolean;
  isCommentPopup?: boolean;
}

const LuminNoteHeaderEditButton: React.FC<LuminNoteHeaderEditButtonProps> = ({
  currentDocument,
  currentUser,
  annotation,
  isDisabledPopup = false,
  isDisabledEdit = false,
  isDisabledDelete = false,
  setIsNotOwnerComment = () => {},
  enableElement,
  disableElement,
  onClickDelete = () => {},
  isShowCheckBox = false,
  isCommentPopup = false,
}) => {
  const { isSelected = true, setFocusingInputValue } = useLuminCommentBoxContext();

  const { t } = useTranslation();
  const anchorEl = useRef<HTMLDivElement>(null);
  const [canModifyAnnotation, setCanModifyAnnotation] = useState<boolean>(core.canModify(annotation));
  const [canModifyContents, setCanModifyContents] = useState<boolean>(core.canModifyContents(annotation));
  const [openPopper, setOpenPopper] = useState<boolean>(false);
  const [openColorPalette, setOpenColorPalette] = useState<boolean>(false);

  const isFreeText = annotation instanceof window.Core.Annotations.FreeTextAnnotation;
  const isCommentAnnotation = isComment(annotation);
  const isResolved = isCommentAnnotation && annotation.getState() === CommentState.Resolved.state;
  const contents = annotation.getCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key) || annotation.getContents();
  const isReply = annotation.isReply();
  const shouldShowCheckBox = isShowCheckBox && !isCommentPopup && !isReply;

  useEffect(() => {
    const onUpdateAnnotationPermission = () => {
      setCanModifyAnnotation(core.canModify(annotation));
      setCanModifyContents(core.canModifyContents(annotation));
    };

    // set is not owner comment in NoteContent
    const isEditable = !isDisabledEdit && core.canModify(annotation);
    const isDeletable = !isDisabledDelete && core.canModifyContents(annotation);
    const isNotOwnerComment = !(isEditable || isDeletable) || isDisabledPopup;
    setIsNotOwnerComment(isNotOwnerComment);

    core.addEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
    return () => core.removeEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
  }, [annotation]);

  useEffect(() => {
    function closePopper() {
      setOpenPopper(false);
    }
    const documentContainerDOM = document.getElementById('DocumentContainer');
    if (!documentContainerDOM) {
      return;
    }
    documentContainerDOM.addEventListener('wheel', closePopper);
    return () => {
      documentContainerDOM.removeEventListener('wheel', closePopper);
    };
  }, []);

  const handleChangeColor = (e: React.MouseEvent) => {
    e.stopPropagation();
    disableElement(DataElements.OPACITY_SLIDER);
    setOpenPopper(false);
    setOpenColorPalette(true);
  };

  const _handleCloseColorPalette = (e: MouseEvent | TouchEvent) => {
    if (anchorEl.current?.contains(e.target as Node)) {
      return;
    }
    enableElement(DataElements.OPACITY_SLIDER);
    setOpenColorPalette(false);
  };

  const renderColorPalette = (): JSX.Element => (
    <Popper open={openColorPalette} anchorEl={anchorEl.current} onClose={_handleCloseColorPalette}>
      <AnnotationStylePopup annotation={annotation} />
    </Popper>
  );

  const onChangeCheckBox = (): void => {
    if (isSelected) {
      core.deselectAnnotation(annotation);
      return;
    }
    core.selectAnnotation(annotation);
  };

  const onHeaderButtonClick = (): void => {
    if (openColorPalette) {
      enableElement(DataElements.OPACITY_SLIDER);
      setOpenColorPalette(false);
    }
    setOpenPopper((opened) => !opened);
  };

  const renderOptionButton = (): JSX.Element | null => {
    if (shouldShowCheckBox && currentUser) {
      return <Checkbox checked={Boolean(isSelected)} onChange={() => onChangeCheckBox()} />;
    }

    const shouldHideOption = shouldShowCheckBox || !currentUser;
    if (shouldHideOption) {
      return null;
    }
    return (
      <div ref={anchorEl}>
        <IconButton onClick={onHeaderButtonClick} icon="three-dots" iconSize={14} />
      </div>
    );
  };

  if ((isDisabledEdit && isDisabledDelete) || isDisabledPopup) {
    return null;
  }

  const renderChangeColorButton = (): JSX.Element | null => {
    const enableChangeColor =
      !isReply &&
      core.getCurrentUser() === annotation.Author &&
      contents &&
      !isResolved &&
      !annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key) &&
      isCommentAnnotation;

    if (!enableChangeColor) {
      return null;
    }
    return (
      <MenuItemBase size="dense" onClick={handleChangeColor} leftSection={<PaletteIcon size="20" />}>
        {t('viewer.noteContent.changeColor')}
      </MenuItemBase>
    );
  };

  const handleEditContent = (): void => {
    if (isFreeText) {
      core.getAnnotationManager().trigger('annotationDoubleClicked', annotation);
    } else {
      setFocusingInputValue(annotation.Id);
    }
    setOpenPopper((opened) => !opened);
  };

  const handleDelete = (): void => {
    if (isReply) {
      core.deleteAnnotations([annotation], {});
      // reopen if comment was mark as resolved
      if (annotation.getState() === CommentState.Cancelled.state) {
        const replyAnnot = new window.Core.Annotations.StickyAnnotation();
        replyAnnot.InReplyTo = annotation.InReplyTo;
        replyAnnot.X = annotation.X;
        replyAnnot.Y = annotation.Y;
        replyAnnot.PageNumber = annotation.PageNumber;
        replyAnnot.Author = annotation.Author;
        replyAnnot.setContents('');
        replyAnnot.setCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key, '');
        replyAnnot.setStateModel('Marked');
        replyAnnot.setState(CommentState.Rejected.state);
        replyAnnot.DateCreated = annotation.DateCreated;

        (annotation as unknown as { addReply: (replyAnnot: Core.Annotations.StickyAnnotation) => void }).addReply(
          replyAnnot
        );
        core.addAnnotations([replyAnnot], {});
      }
    } else {
      const focusedInput: HTMLInputElement = document.querySelector(
        '.reply-container .NoteInput__container richTextInput'
      );
      if (focusedInput) {
        focusedInput.blur();
      }
      setOpenPopper(false);
      onClickDelete();
    }
  };

  const renderEditContentButton = (): JSX.Element | null => {
    const enableEditContent = core.getCurrentUser() === annotation.Author && !isResolved;
    if (!enableEditContent) {
      return null;
    }
    return (
      <MenuItemBase
        size="dense"
        disabled={isDisabledEdit}
        onClick={handleEditContent}
        leftSection={<PencilSimpleIcon size="20" />}
      >
        {t('action.edit')}
      </MenuItemBase>
    );
  };

  const renderDownloadButton = (): JSX.Element | null => {
    if (isCommentAnnotation) {
      return null;
    }
    return (
      <MenuItemBase
        size="dense"
        onClick={() => exportNotesToTXT({ notesToExport: [annotation], documentName: currentDocument.name })}
        leftSection={<DownloadSimpleIcon size="20" />}
      >
        {t('viewer.noteContent.export')}
      </MenuItemBase>
    );
  };

  const isEditable = !isDisabledEdit && canModifyContents;
  const isDeletable = !isDisabledDelete && canModifyAnnotation;

  if (!(isEditable || isDeletable) || isDisabledPopup) {
    return null;
  }

  return (
    <div
      className={classNames(styles.editButtonContainer, {
        [styles.isReply]: isReply,
        [styles.isCommentPopup]: isCommentPopup,
      })}
    >
      {renderOptionButton()}
      <Popper
        open={openPopper}
        anchorEl={anchorEl.current}
        onClose={() => setOpenPopper(false)}
        paperProps={{ className: styles.popperContainer }}
      >
        {renderChangeColorButton()}
        {renderEditContentButton()}
        <MenuItemBase size="dense" onClick={handleDelete} leftSection={<TrashIcon size="20" />}>
          {t('action.delete')}
        </MenuItemBase>
        {renderDownloadButton()}
      </Popper>
      {renderColorPalette()}
    </div>
  );
};

export default LuminNoteHeaderEditButton;

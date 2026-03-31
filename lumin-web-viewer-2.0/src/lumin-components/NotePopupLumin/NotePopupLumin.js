/* eslint-disable sonarjs/cognitive-complexity */
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import AnnotationStylePopup from 'lumin-components/AnnotationStylePopup';
import { isComment as isCommentHelper } from 'lumin-components/CommentPanel/helper';
import Icomoon from 'lumin-components/Icomoon';
import MaterialPopper from 'lumin-components/MaterialPopper';
import CommentContext from 'lumin-components/NoteCommentBox/CommentContext';
import NoteContext from 'lumin-components/NoteLumin/Context';
import Checkbox from 'lumin-components/ViewerCommon/Checkbox';

import { useTranslation, useThemeMode } from 'hooks';

import exportNotesToTXT from 'helpers/exportNotesToTXT';

import CommentState from 'constants/commentState';
import { CUSTOM_DATA_COMMENT_HIGHLIGHT, CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';
import DataElements from 'constants/dataElement';

import './NotePopupLumin.scss';

const propTypes = {
  annotation: PropTypes.object.isRequired,
  setIsEditing: PropTypes.func.isRequired,
  setIsShowDeleteOverlay: PropTypes.func,
  isResolved: PropTypes.bool,
  setIsNotOwnerComment: PropTypes.func,
  isCommentPanel: PropTypes.bool.isRequired,
};

const NotePopupLumin = ({
  annotation,
  setIsEditing,
  setIsShowDeleteOverlay,
  isResolved,
  setIsNotOwnerComment,
  isCommentPanel,
}) => {
  const [isDisabled, isEditDisabled, isDeleteDisabled, currentDocument] = useSelector(
    (state) => [
      selectors.isElementDisabled(state, 'notePopup'),
      selectors.isElementDisabled(state, 'notePopupEdit'),
      selectors.isElementDisabled(state, 'notePopupDelete'),
      selectors.getCurrentDocument(state),
    ],
    shallowEqual
  );
  const [canModify, setCanModify] = useState(core.canModify(annotation));
  const [canModifyContents, setCanModifyContents] = useState(core.canModifyContents(annotation));
  const [open, setOpen] = useState(false);
  const [openColorPalette, setOpenColorPalette] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const themeMode = useThemeMode();
  const anchorEl = useRef();
  const {
    isInsideComment = false,
    openCommentPanel = () => {},
    disabledElements = {},
    setIsFocusInput,
    isMyNoteToExport,
    isSelected,
  } = useContext(isCommentPanel ? CommentContext : NoteContext);
  const isFreeText = annotation instanceof window.Core.Annotations.FreeTextAnnotation;
  const isReply = annotation.isReply();
  const contents = annotation.getCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key) || annotation.getContents();
  const isComment = isCommentHelper(annotation);

  useEffect(() => {
    const onUpdateAnnotationPermission = () => {
      setCanModify(core.canModify(annotation));
      setCanModifyContents(core.canModifyContents(annotation));
    };
    // set is not owner comment in NoteContent
    const isEditable = !isEditDisabled && core.canModify(annotation);
    const isDeletable = !isDeleteDisabled && core.canModifyContents(annotation);
    const isNotOwnerComment = !(isEditable || isDeletable) || isDisabled;
    setIsNotOwnerComment(isNotOwnerComment);

    core.addEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
    return () => core.removeEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
  }, [annotation]);

  useEffect(() => {
    function closePopper() {
      setOpen(false);
    }
    const documentContainerDOM = document.getElementById('DocumentContainer');
    documentContainerDOM.addEventListener('wheel', closePopper);
    return () => {
      documentContainerDOM.removeEventListener('wheel', closePopper);
    };
  }, []);

  const handleChangeColor = () => {
    dispatch(actions.disableElement(DataElements.OPACITY_SLIDER));
    setOpen(false);
    setOpenColorPalette(true);
  };

  const handleEdit = () => {
    if (isFreeText) {
      core.getAnnotationManager().trigger('annotationDoubleClicked', annotation);
    } else {
      setTimeout(() => {
        setIsEditing(true);
        setIsFocusInput(true);
      }, 0);
    }
    setOpen(!open);
  };

  const handleDelete = () => {
    if (isReply) {
      core.deleteAnnotations([annotation], {});
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

        annotation.addReply(replyAnnot);

        core.addAnnotations([replyAnnot], {});
      }
    } else {
      const focusedInput = document.querySelector('.reply-container .NoteInput__container richTextInput');
      if (focusedInput) {
        focusedInput.blur();
      }
      setOpen(false);
      setIsShowDeleteOverlay(true);
    }
  };

  const _handleClose = (e) => {
    if (anchorEl.current.contains(e.target)) return;
    setOpen(false);
  };

  const _handleCloseColorPalette = (e) => {
    if (anchorEl.current.contains(e.target)) {
      return;
    }
    dispatch(actions.enableElement(DataElements.OPACITY_SLIDER));
    setOpenColorPalette(false);
  };

  const _openCommentPanel = () => {
    setOpen(false);
    openCommentPanel();
  };

  const isEditable = !isEditDisabled && canModifyContents;
  const isDeletable = !isDeleteDisabled && canModify;

  const MenuListClass = classNames('NotePopupLumin__MenuList', {
    'NotePopupLumin__MenuList--comment': isComment && !isReply,
  });

  const renderRightButton = () => {
    if (isMyNoteToExport) {
      return (
        <Checkbox
          type="checkbox"
          checked={Boolean(isSelected)}
          onChange={() => (isSelected ? core.deselectAnnotation(annotation) : core.selectAnnotation(annotation))}
        />
      );
    }
    return (
      <Button
        className={`square overflow  ${(open || openColorPalette) && 'open'}`}
        aria-label="note"
        ref={(node) => (anchorEl.current = node)}
        onMouseDown={() => {
          if (openColorPalette) {
            dispatch(actions.enableElement(DataElements.OPACITY_SLIDER));
            setOpenColorPalette(false);
          }
          setOpen(!open);
        }}
      >
        <Icomoon className="three-dots" size={16} />
      </Button>
    );
  };

  const renderColorPalette = () => (
    <MaterialPopper
      open={openColorPalette}
      disablePortal={false}
      parentOverflow="window"
      anchorEl={anchorEl.current}
      handleClose={_handleCloseColorPalette}
      placement="bottom-end"
      classes={`NotePopup__popper-comment theme-${themeMode}`}
      hasDropDownList
    >
      {openColorPalette ? (
        <div className="commentColorPalette">
          <AnnotationStylePopup
            placement="bottom-end"
            annotation={annotation}
            isOpen={openColorPalette}
          />
        </div>
      ) : null}
    </MaterialPopper>
  );

  return !(isEditable || isDeletable) || isDisabled ? null : (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={classNames('NotePopup', { 'NotePopup__left-panel--flex-end': !isComment })}
      onClick={(e) => e.stopPropagation()}
    >
      {renderRightButton()}
      <MaterialPopper
        open={open}
        disablePortal={false}
        parentOverflow="window"
        anchorEl={anchorEl.current}
        handleClose={_handleClose}
        placement="bottom-end"
        classes={`NotePopup__popper-comment theme-${themeMode}`}
      >
        <MenuList className={MenuListClass} disablePadding>
          {!isReply &&
            core.getCurrentUser() === annotation.Author &&
            !disabledElements?.annotationStyleEditButton &&
            contents &&
            !isResolved &&
            !annotation.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key) &&
            isComment && (
              <MenuItem onClick={handleChangeColor}>
                <Icomoon className="paint" size={16} />
                {t('viewer.noteContent.changeColor')}
              </MenuItem>
            )}
          {core.getCurrentUser() === annotation.Author && !isResolved && (
            <MenuItem onClick={handleEdit}>
              <Icomoon className="edit-mode" size={16} />
              {t('action.edit')}
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete}>
            <Icomoon className="trash" size={16} />
            {t('action.delete')}
          </MenuItem>
          {!isComment && (
            <MenuItem
              onClick={() => exportNotesToTXT({ notesToExport: [annotation], documentName: currentDocument.name })}
            >
              <Icomoon className="download-2" size={16} />
              {t('viewer.noteContent.export')}
            </MenuItem>
          )}
          {isInsideComment && (
            <MenuItem onClick={_openCommentPanel}>
              <Icomoon className="outlines icon__16" />
              {t('viewer.noteContent.openAnnotation')}
            </MenuItem>
          )}
        </MenuList>
      </MaterialPopper>
      {renderColorPalette()}
    </div>
  );
};
NotePopupLumin.propTypes = propTypes;
NotePopupLumin.defaultProps = {
  isResolved: false,
  setIsShowDeleteOverlay: () => {},
  setIsNotOwnerComment: () => {},
};

export default NotePopupLumin;

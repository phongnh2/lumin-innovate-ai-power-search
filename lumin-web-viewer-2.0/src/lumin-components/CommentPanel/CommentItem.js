import PropTypes from 'prop-types';
import React, { useState, useMemo } from 'react';

import core from 'core';

import NoteCommentBox from 'luminComponents/NoteCommentBox';
import CommentContext from 'luminComponents/NoteCommentBox/CommentContext';

function CommentItem({
  note, onResize, selectedNoteIds, isFocusInput, setIsFocusInput,
}) {
  const [editingContent, setEditingContent] = useState('');
  const contextValue = useMemo(
    () => ({
      isSelected: selectedNoteIds[note.Id],
      isFocusInput,
      setIsFocusInput,
      isInsideComment: false,
      isContentEditable: core.canModify(note),
      editingContent,
      setEditingContent,
    }),
    [selectedNoteIds, note, isFocusInput, setIsFocusInput, editingContent]
  );

  return (
    <CommentContext.Provider value={contextValue}>
      <NoteCommentBox annotation={note} onResize={onResize} />
    </CommentContext.Provider>
  );
}

CommentItem.propTypes = {
  note: PropTypes.object.isRequired,
  onResize: PropTypes.func.isRequired,
  selectedNoteIds: PropTypes.object.isRequired,
  isFocusInput: PropTypes.bool.isRequired,
  setIsFocusInput: PropTypes.func.isRequired,
};

CommentItem.defaultProps = {};
export default CommentItem;

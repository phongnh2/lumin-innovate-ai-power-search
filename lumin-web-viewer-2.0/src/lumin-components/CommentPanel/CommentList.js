import PropTypes from 'prop-types';
import React, { memo } from 'react';

import CommentItem from './CommentItem';

const CommentList = ({ notes, ...props }) =>
  notes.map((currNote) => <CommentItem key={currNote.Id} {...props} note={currNote} />);

CommentList.propTypes = {
  notes: PropTypes.array.isRequired,
  onResize: PropTypes.func.isRequired,
  selectedNoteIds: PropTypes.object.isRequired,
  isFocusInput: PropTypes.bool.isRequired,
  setIsFocusInput: PropTypes.func.isRequired,
};

CommentList.defaultProps = {};
export default memo(CommentList);

import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import LuminCommentBox from '@new-ui/components/LuminCommentBox';

import core from 'core';

import ListSeparator from 'lumin-components/ListSeparator';

import { getSortStrategies } from 'constants/sortStrategies';

import styles from './LuminNoteHistoryItem.module.scss';

export default function LuminNoteHistoryItem({
  selectedNoteIds,
  index,
  sortedNotes,
  currentNote,
  sortStrategy,
  pageLabels,
  isEligibleForFocus,
}) {
  const separator = useMemo(() => {
    const { shouldRenderSeparator, getSeparatorContent } = getSortStrategies()[sortStrategy];
    const prevNote = index === 0 ? null : sortedNotes[index - 1];
    const canShowSeparator = shouldRenderSeparator(prevNote, currentNote);

    if (canShowSeparator) {
      return (
        <ListSeparator
          className={styles.separator}
          renderContent={() => getSeparatorContent(prevNote, currentNote, { pageLabels })}
        />
      );
    }
    return null;
  }, [sortStrategy, index, currentNote, pageLabels, sortedNotes]);

  return (
    <div>
      {separator}
      <LuminCommentBox
        annotation={currentNote}
        isSelected={selectedNoteIds[currentNote.Id] || false}
        isContentEditable={core.canModify(currentNote)}
        isNoteHistory
        isEligibleForFocus={isEligibleForFocus}
      />
    </div>
  );
}

LuminNoteHistoryItem.propTypes = {
  currentNote: PropTypes.object.isRequired,
  selectedNoteIds: PropTypes.object.isRequired,
  sortStrategy: PropTypes.string.isRequired,
  pageLabels: PropTypes.array.isRequired,
  index: PropTypes.number,
  sortedNotes: PropTypes.array,
  isEligibleForFocus: PropTypes.bool.isRequired,
};

LuminNoteHistoryItem.defaultProps = {
  index: 0,
  sortedNotes: [],
};

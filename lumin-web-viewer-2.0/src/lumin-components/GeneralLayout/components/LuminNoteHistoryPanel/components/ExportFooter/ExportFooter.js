import PropTypes from 'prop-types';
import React from 'react';

import core from 'core';

import { useTranslation } from 'hooks';

import exportNotesToTXT from 'helpers/exportNotesToTXT';

import * as Styled from './ExportFooter.styled';

export default function ExportFooter({ isShowedFooter, sortedNotes, selectedNoteKeys, currentDocument, currentUser }) {
  const { t } = useTranslation();

  const notesToExport = sortedNotes.filter((item) => {
    if (selectedNoteKeys.includes(item.Id) && item.Author === currentUser.email) {
      return item;
    }
    return false;
  });

  const onSelectAll = () => {
    core.selectAnnotations(sortedNotes);
  };

  const onDeselectAll = () => {
    core.deselectAllAnnotations(sortedNotes);
  };

  return (
    <Styled.FooterContainer isShowed={isShowedFooter}>
      <Styled.FooterWrapper>
        <Styled.ClosePanelButton icon="cancel" onClick={onDeselectAll} disabled={!selectedNoteKeys.length} />
        <Styled.DescriptionContainer>
          <Styled.Description>
            {notesToExport.length}/{sortedNotes.length} {t('setUpOrg.textSelected')}
          </Styled.Description>

          <Styled.SelectButton onClick={onSelectAll}>{t('viewer.notePanel.selectAll')}</Styled.SelectButton>

        </Styled.DescriptionContainer>

        <Styled.ExportButton onClick={() => exportNotesToTXT({ notesToExport, documentName: currentDocument.name })}>
          {t('viewer.noteContent.export')}
        </Styled.ExportButton>
      </Styled.FooterWrapper>
    </Styled.FooterContainer>
  );
}

ExportFooter.propTypes = {
  isShowedFooter: PropTypes.bool,
  sortedNotes: PropTypes.array,
  selectedNoteKeys: PropTypes.array,
  currentUser: PropTypes.object.isRequired,
  currentDocument: PropTypes.object.isRequired,
};

ExportFooter.defaultProps = {
  isShowedFooter: false,
  sortedNotes: [],
  selectedNoteKeys: [],
};

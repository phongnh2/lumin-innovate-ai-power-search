/* eslint-disable arrow-body-style */
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import SvgElement from 'lumin-components/SvgElement';

import { useTranslation } from 'hooks';

import { dateUtil } from 'utils';

import { documentStorage } from 'constants/documentConstants';

import * as Styled from './RestoreOriginalModalContent.styled';

const MainContent = ({ currentDocument }) => {
  const { t } = useTranslation();
  const isDriveStorage = useMemo(() => currentDocument.service === documentStorage.google, [currentDocument.service]);
  return (
    <Styled.Wrapper>
      <SvgElement content="new-warning" width={48} height={48} />
      <Styled.Title>{t('viewer.restoreOriginalVersionModal.title')}</Styled.Title>
      <Styled.Msg>
        {t(
          isDriveStorage
            ? 'viewer.restoreOriginalVersionModal.descriptionDrive'
            : 'viewer.revision.originalVersion.restoreDescription',
          {
            time: dateUtil.formatFullDate(new Date(Number(currentDocument.backupInfo.createdAt))),
          }
        )}
      </Styled.Msg>
    </Styled.Wrapper>
  );
};

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = {};

MainContent.propTypes = {
  currentDocument: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MainContent);

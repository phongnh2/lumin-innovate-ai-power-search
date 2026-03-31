import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { handleChangeName } from 'lumin-components/HeaderLumin/utils';

import withDocumentItemAuthorization from 'src/HOC/withDocumentItemAuthorization';

import { useTranslation } from 'hooks/useTranslation';

import fileUtils from 'utils/file';
import { eventTracking } from 'utils/recordUtil';

import { DocumentActions } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';

import * as Styled from '../../TitleBarLeftSection.styled';

const DocumentName = (props) => {
  const { document, setCurrentDocument, isOffline, withAuthorize } = props;
  const filenameWithoutExtension = fileUtils.getFilenameWithoutExtension(document.name);
  const [documentName, setDocumentName] = useState(filenameWithoutExtension);

  const autoSizeRef = useRef();

  const { t } = useTranslation();

  const onKeyPressEnter = (e) => {
    if (e.key === 'Enter') {
      autoSizeRef.current.blur();
    }
  };

  const hasRenamePermission = () => withAuthorize(DocumentActions.Rename);

  const onClick = () => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: UserEventConstants.Events.HeaderButtonsEvent.CHANGE_NAME,
    });
  };

  const disabled = !hasRenamePermission() || isOffline || document.isSystemFile;

  const onBlur = () => handleChangeName({ documentName, setDocumentName, setCurrentDocument, document, t });

  const onChange = (e) => setDocumentName(e.target.value);

  useEffect(() => {
    setDocumentName(fileUtils.getFilenameWithoutExtension(document.name));
  }, [document.name]);

  return (
    <Styled.DocumentNameContainer>
      <Styled.DocumentName
        title={document.name}
        value={documentName}
        type="text"
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        onKeyPress={onKeyPressEnter}
        ref={autoSizeRef}
        injectStyles={false}
        onClick={onClick}
      />
    </Styled.DocumentNameContainer>
  );
};

DocumentName.propTypes = {
  document: PropTypes.object,
  setCurrentDocument: PropTypes.func,
  isOffline: PropTypes.bool,
  withAuthorize: PropTypes.func.isRequired,
};

DocumentName.defaultProps = {
  document: {},
  setCurrentDocument: (f) => f,
  isOffline: false,
};

const mapStateToProps = (state) => ({
  document: selectors.getCurrentDocument(state),
  isOffline: selectors.isOffline(state),
});

const mapDispatchToProps = (dispatch) => ({
  setCurrentDocument: (document) => dispatch(actions.setCurrentDocument(document)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withDocumentItemAuthorization(DocumentName));

import { MenuItem } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import { useTranslation, useDocumentTour } from 'hooks';

import { documentGraphServices } from 'services/graphServices';

import { eventTracking } from 'utils';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import UserEventConstants from 'constants/eventConstants';
import { STATUS_CODE, STORAGE_TYPE } from 'constants/lumin-common';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { socket } from '../../../../../../../../socket';

const Star = ({ currentUser = null, currentDocument, updateCurrentDocument }) => {
  const { t } = useTranslation();
  const { isTourDocument } = useDocumentTour();
  const isSystemFile = currentDocument.service === STORAGE_TYPE.SYSTEM;
  const disabled = currentDocument.service === STORAGE_TYPE.CACHING;
  const { isTemplateViewer } = useTemplateViewerMatch();

  const isStarred = useMemo(() => {
    if (isSystemFile) {
      return currentDocument.isStarred;
    }
    return currentDocument.listUserStar && currentDocument.listUserStar.includes(currentUser._id);
  }, [currentUser._id, currentDocument.isStarred, currentDocument.listUserStar, isSystemFile]);

  const starIcon = isStarred ? 'md_unstar_document' : 'md_star_document';

  if (currentUser && !isTourDocument && !currentDocument.isSystemFile && !isTemplateViewer) {
    const callback = (data) => {
      if (data.statusCode === STATUS_CODE.SUCCEED) {
        const updatedDocument = {
          ...currentDocument,
          listUserStar: data.document.listUserStar,
        };
        updateCurrentDocument(updatedDocument);
      }
      eventTracking(UserEventConstants.EventType.CLICK, {
        elementName: UserEventConstants.Events.HeaderButtonsEvent.ADD_TO_STAR,
      });
    };

    const onClick = async (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }

      if (isSystemFile) {
        systemFileHandler.starFile({ documentId: currentDocument._id, isStarred: !currentDocument.isStarred });
        return;
      }
      const clientId = currentUser._id;
      documentGraphServices.starDocumentMutation({
        document: currentDocument,
        currentUser,
        clientId,
        callback,
      });
      socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, { roomId: currentDocument._id, type: 'star' });
    };

    return (
      <MenuItem
        disabled={disabled}
        closeMenuOnClick={false}
        leftSection={<Icomoon className={starIcon} size={24} />}
        key={starIcon}
        onClick={onClick}
        size="dense"
      >
        {t(isStarred ? 'folderSection.removeFromStarred' : 'folderSection.addToStarred')}
      </MenuItem>
    );
  }
  return null;
};

Star.propTypes = {
  currentUser: PropTypes.object,
  currentDocument: PropTypes.object.isRequired,
  updateCurrentDocument: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateCurrentDocument: (document) => dispatch(actions.updateCurrentDocument(document)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Star);

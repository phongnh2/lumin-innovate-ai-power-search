import { isEmpty } from 'lodash';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import selectors from 'selectors';

import { DocumentContext } from 'lumin-components/Document/context';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import useShallowSelector from 'hooks/useShallowSelector';

import { eventTracking } from 'utils';
import { getDocAuthorizationHOF } from 'utils/documentAuthorization';

import { openMoveDocumentModal } from 'features/MoveDocumentModal';
import { useIsTempEditMode } from 'features/OpenForm';

import { DocumentActions, DOCUMENT_TYPE, layoutType } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';

const MoveDocumentProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isTempEditMode } = useIsTempEditMode();
  const currentUser = useGetCurrentUser();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const orgs = useShallowSelector(selectors.getOrganizationList).data;
  const [isMoving, setIsMoving] = useState(false);
  const [selectDocMode, setSelectDocMode] = useState([]);
  const [documentLayout, setDocumentLayout] = useState(layoutType.list);
  const isOrgTeamDocument = () => get(currentDocument, 'belongsTo.type', '') === DOCUMENT_TYPE.ORGANIZATION_TEAM;
  const isSharedUser = currentDocument.isShared || currentDocument.isGuest;
  const isLocalFile = currentDocument.isSystemFile;

  const getOwnedOrganization = () =>
    orgs
      .map(({ organization }) => organization)
      .find(({ _id }) => _id === currentDocument.belongsTo.location.ownedOrgId);

  const getTeams = () => (isOrgTeamDocument() && !isEmpty(orgs) && !isSharedUser ? getOwnedOrganization().teams : []);
  const _handleClickMoveDocument = () => {
    dispatch(openMoveDocumentModal([currentDocument]));
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: UserEventConstants.Events.HeaderButtonsEvent.MOVE_DOCUMENT,
    });
  };
  const checkPermission = currentDocument?.documentType
    ? getDocAuthorizationHOF({
        teams: getTeams(),
        document: currentDocument,
        currentUser,
        orgData: orgs,
      })
    : null;

  const documentContext = useMemo(
    () => ({
      documentLayout,
      selectDocMode,
      isMoving,
      setIsMoving,
      setDocumentLayout,
      setSelectDocMode,
      setRemoveDocList: () => {},
      showRemoveMultipleModal: () => {},
    }),
    [documentLayout, selectDocMode, isMoving]
  );
  const disabled = isTempEditMode || isLocalFile || !checkPermission?.(DocumentActions.Move);

  return (
    <DocumentContext.Provider value={documentContext}>
      {children({
        disabled,
        openMoveDocumentModal: _handleClickMoveDocument,
      })}
    </DocumentContext.Provider>
  );
};

MoveDocumentProvider.propTypes = {
  children: PropTypes.func.isRequired,
};

export default MoveDocumentProvider;

import get from 'lodash/get';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { isAutoSync, isSyncableFile } from 'helpers/autoSync';

import { exitEditPdfMode } from 'utils/editPDF';

import { AUTO_SYNC_CHANGE_TYPE, SYNC_RESULT } from 'constants/autoSyncConstant';
import { AnimationBanner } from 'constants/banner';
import { DataElements } from 'constants/dataElement';
import { LocalStorageKey } from 'constants/localStorageKey';

export default function useFinishSyncDrive({ currentDocument, currentUser }) {
  const dispatch = useDispatch();

  const handleOpenRatingModal = async () => {
    const isAutoSyncDocument = isAutoSync(currentDocument);
    const isRated = get(currentUser, 'metadata.ratedApp', true);
    const shouldShowRatingModal =
      !JSON.parse(localStorage.getItem(LocalStorageKey.SHOWED_RATING_APP)) &&
      !isRated &&
      currentUser.isShowRatingViaSync;

    if (!shouldShowRatingModal) {
      return;
    }

    if (!isAutoSyncDocument) {
      dispatch(actions.setShouldShowRating(AnimationBanner.SHOW));
    }
  };

  const handleSyncResult = (event) => {
    if (event.detail.status === SYNC_RESULT.SUCCESS) {
      handleOpenRatingModal();
    }
    if (event.detail.action.includes(AUTO_SYNC_CHANGE_TYPE.EDIT_PDF)) {
      dispatch(actions.closeElement(DataElements.LOADING_MODAL));
      exitEditPdfMode();
    }
  };

  useEffect(() => {
    if (isSyncableFile(currentDocument)) {
      window.addEventListener('finishSyncDrive', handleSyncResult);
    }
    return () => {
      if (isSyncableFile(currentDocument)) {
        window.removeEventListener('finishSyncDrive', handleSyncResult);
      }
    };
  }, []);
}

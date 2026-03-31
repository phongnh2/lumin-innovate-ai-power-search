/* eslint-disable react/prop-types */
import { enqueueSnackbar } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';

import core from 'core';

import ViewerContext from 'screens/Viewer/Context';

import { useTranslation } from 'hooks/useTranslation';

import { KEEP_AT_LEAST_ONE_PAGE } from 'constants/messages';

import { CLICK_ACTION_EVENT_MAPPING } from './constants';
import usePagetoolActionFromThumbnail from './hooks/usePagetoolActionFromThumbnail';
// eslint-disable-next-line import/no-cycle
import { ThumbnailMenuContext } from './ThumbnailMenu';

export const withConfirmDeleteModal = (Component, fromOverlayBtn) => (props) => {
  const { t } = useTranslation();
  const context = useContext(ThumbnailMenuContext);
  const { pageWillBeDeleted } = useContext(ViewerContext);
  const { removePage, handleSendClickEvent, isOffline } = usePagetoolActionFromThumbnail();
  const totalPages = core.getTotalPages();
  const hasPendingDeletion = pageWillBeDeleted !== -1;
  const isLastRemainingPage = totalPages <= 1 || (totalPages === 2 && hasPendingDeletion);
  const disabled = isOffline || isLastRemainingPage;
  const disabledReason = isLastRemainingPage ? t(KEEP_AT_LEAST_ONE_PAGE) : '';
  const page = (typeof props.index === 'number' ? props.index : context?.index ?? 0) + 1;

  const onPrimaryClick = async () => {
    if (isLastRemainingPage) {
      enqueueSnackbar({
        message: t(KEEP_AT_LEAST_ONE_PAGE),
        variant: 'warning',
      });
      return;
    }

    handleSendClickEvent(
      fromOverlayBtn ? CLICK_ACTION_EVENT_MAPPING.deletePageFromOverlayBtn : CLICK_ACTION_EVENT_MAPPING.deletePage
    );
    const callback = () => {
      core.setCurrentPage(page);
      if (context) {
        context.handleClose();
      }
    };

    await removePage({ page, callback });
  };

  return <Component {...props} handleOpen={onPrimaryClick} disabled={disabled} disabledReason={disabledReason} />;
};

export default withConfirmDeleteModal;

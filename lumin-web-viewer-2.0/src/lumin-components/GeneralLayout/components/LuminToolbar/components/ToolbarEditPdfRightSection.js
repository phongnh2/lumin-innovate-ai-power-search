import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { connect, useDispatch } from 'react-redux';

import { setBackDropMessage } from 'actions/customActions';

import actions from 'actions';

import { LEFT_SIDE_BAR_VALUES } from 'lumin-components/GeneralLayout/components/LuminLeftSideBar/constants';
import * as Styled from 'lumin-components/GeneralLayout/components/LuminToolbar/LuminToolbar.styled';
import useToolProperties from 'luminComponents/GeneralLayout/hooks/useToolProperties';

import { useTranslation, useDisabledHeaderButton } from 'hooks';

import { pageContentUpdatedListener } from 'helpers/pageContentUpdatedListener';

import { onConfirmSaveEditedText, onCancelSaveEditText } from 'utils/editPDF';

import { toolCallingQueue } from 'features/EditorChatBot/utils/toolCallingQueue';
import { useSyncedQueueContext } from 'features/FileSync';
import { useHandleManipulateDateGuestMode } from 'features/GuestModeManipulateCache/useHandleManipuldateGuestMode';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';

const ToolbarEditPdfRightSection = (props) => {
  const { setToolbarValue } = props;
  const { t } = useTranslation();
  const { disabledDoneBtn, disabledDiscardBtn } = useDisabledHeaderButton();
  const { closeToolPropertiesPanel } = useToolProperties();
  const dispatch = useDispatch();
  const { isManipulateInGuestMode, handleStoreExploreFeatureGuestMode } = useHandleManipulateDateGuestMode();

  const { changedQueue } = useSyncedQueueContext();
  const confirmSave = async () => {
    await onConfirmSaveEditedText({
      asyncStorageSync: true,
      isManipulateInGuestMode,
      handleStoreExploreFeatureGuestMode,
    });
    closeToolPropertiesPanel();
    setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value);
  };

  const discardChange = async () => {
    const hasEditPdfChanges = changedQueue.some(
      (action) =>
        action.includes(AUTO_SYNC_CHANGE_TYPE.EDIT_PDF) || action.includes(AUTO_SYNC_CHANGE_TYPE.CONTENT_CHANGE)
    );

    const isProcessingContent = pageContentUpdatedListener.isProcessingUpdateContent();
    const forceReload = hasEditPdfChanges || isProcessingContent;

    await onCancelSaveEditText({ forceReload });
    closeToolPropertiesPanel();
    setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value);
    toolCallingQueue.clearQueue('editText');
    dispatch(setBackDropMessage(null));
  };

  return (
    <Styled.ToolbarSectionWrapper data-cy="toolbar_edit_pdf_right_section">
      <Button onClick={discardChange} variant="outlined" disabled={disabledDiscardBtn}>
        {t('action.discardChanges')}
      </Button>
      <Button onClick={confirmSave} disabled={disabledDoneBtn} variant="filled">
        {t('common.done')}
      </Button>
    </Styled.ToolbarSectionWrapper>
  );
};

ToolbarEditPdfRightSection.propTypes = {
  setToolbarValue: PropTypes.func.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  setToolbarValue: (value) => dispatch(actions.setToolbarValue(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarEditPdfRightSection);

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { TransitionProps } from '@mui/material/transitions';
import React, { useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { AnyAction } from 'redux';

import { MenuItem } from '@new-ui/general-components/Menu';
import { ModalSize } from '@new-ui/general-components/Modal/constants';

import actions from 'actions';
import { AppDispatch } from 'store';

import { useModalTracking } from 'features/Outline/hooks/useModalTracking';
import { OutlineEvent } from 'features/Outline/types';

import { ModalTypes } from 'constants/lumin-common';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import { OutlineBranchContext, OutlineTreeContext } from '../../contexts';

interface IOutlineMenuItemProps {
  type: OutlineEvent;
  title: string;
  setOutlineEvent: (outlineEvent: OutlineEvent) => void;
}

const AddOutlineEvents: string[] = [OutlineEvent.ADD, OutlineEvent.ADD_SUB, OutlineEvent.EDIT];

const OutlineMenuItem = (props: IOutlineMenuItemProps): JSX.Element => {
  const { type, title, setOutlineEvent, ...otherProps } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { onClose } = useContext(OutlineBranchContext);
  const { removeOutline } = useContext(OutlineTreeContext);
  const { trackModalConfirm, trackModalDismiss, trackModalViewed } = useModalTracking(type);
  const hasConfirmed = useRef(false);
  const isCheckedRef = useRef(false);

  const handleCancel = () => {
    hasConfirmed.current = false;
    trackModalDismiss();
  };

  const handleConfirm = (isChecked: boolean) => {
    if (!hasConfirmed.current) {
      return;
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY.SHOULD_NOT_SHOW_DELETE_OUTLINE_BOX_WARNING_MODAL, isChecked.toString());
    removeOutline();
    trackModalConfirm();
  };

  const showModal = () => {
    const modalSettings = {
      type: ModalTypes.WARNING,
      size: ModalSize.MEDIUM,
      title: t('outlines.modal.delete.title'),
      message: t('outlines.modal.delete.desc'),
      checkboxMessage: t('modalWarningDeleteContentBox.checkboxMessage'),
      footerVariant: 'variant3',
      confirmButtonTitle: t('common.delete'),
      onCancel: handleCancel,
      onConfirm: (isChecked: boolean) => {
        hasConfirmed.current = true;
        isCheckedRef.current = isChecked;
      },
      TransitionProps: {
        onExited: () => handleConfirm(isCheckedRef.current),
      } as unknown as TransitionProps,
    };

    trackModalViewed();
    dispatch(actions.openViewerModal(modalSettings));
  };

  const handleDelete = () => {
    const shouldShowWarning =
      sessionStorage.getItem(SESSION_STORAGE_KEY.SHOULD_NOT_SHOW_DELETE_OUTLINE_BOX_WARNING_MODAL) !== 'true';

    if (shouldShowWarning) {
      showModal();
    } else {
      removeOutline();
    }
  };

  const handleClickMenuItem = () => {
    onClose();

    if (AddOutlineEvents.includes(type)) {
      setOutlineEvent(type);
    }

    if (type === OutlineEvent.DELETE) {
      handleDelete();
    }
  };

  return (
    <MenuItem onClick={handleClickMenuItem} {...otherProps}>
      {title}
    </MenuItem>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setOutlineEvent: (data: string) => dispatch(actions.setOutlineEvent(data) as AnyAction),
});

export default connect(mapStateToProps, mapDispatchToProps)(OutlineMenuItem);

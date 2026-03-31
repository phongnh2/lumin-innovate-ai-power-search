/* eslint-disable react/jsx-no-bind */
import classNames from 'classnames';
import { Modal as KiwiModal, Checkbox as KiwiCheckbox, ModalTypes as KiwiModalTypes } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { Img } from 'react-image';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import TadaSvg from 'assets/lumin-svgs/tada.svg';
import CreateTeamFailedDarkImg from 'assets/reskin/images/ilustration-create-team-failed-dark.png';
import CreateTeamFailedImg from 'assets/reskin/images/ilustration-create-team-failed.png';

import actions from 'actions';
import selectors from 'selectors';

import ButtonMaterial, { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';
import Icomoon from 'lumin-components/Icomoon';
import MultilingualButton from 'lumin-components/MultilingualButton';
import { Checkbox } from 'lumin-components/Shared/Checkbox';
import CircularLoading from 'luminComponents/CircularLoading';
import Dialog from 'luminComponents/Dialog';
import SvgElement from 'luminComponents/SvgElement';

import { useConfetti, useEnableWebReskin, useTabletMatch, useThemeMode, useTranslation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import InvitesToAddDocStackModal from 'features/InvitesToAddDocStackModal';
import { useCheckModalAvailable } from 'features/InvitesToAddDocStackModal/hooks';

import { ModalTypes, THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';
import { ModalPriority } from 'constants/styles/Modal';

import { useCloseModalOnRouteChange } from './hooks';

import styles from './MaterialModal.module.scss';

import './MaterialModal.scss';

MaterialModal.propTypes = {
  closeModal: PropTypes.func,
  modalData: PropTypes.object,
};

MaterialModal.defaultProps = {
  closeModal: () => {},
  modalData: {
    open: false,
    type: ModalTypes.WARNING,
    isFullWidthButton: false,
    onConfirm: () => {},
  },
};

const BUTTON_FULL_CLASSES = 'MaterialButton__btn--full';

// eslint-disable-next-line sonarjs/cognitive-complexity
function MaterialModal({
  closeModal,
  modalData: {
    fullScreen,
    cancelButtonTitle,
    cancelButtonColor = ButtonColor.TERTIARY,
    open: _open,
    type,
    title,
    boldMessage,
    message,
    confirmButtonTitle,
    confirmButtonType = 'button',
    href = '',
    onCancel,
    onConfirm,
    color,
    isFullWidthButton,
    isCustomModal,
    firstButtonTitle,
    secondButtonTitle,
    onFirstButtonClick,
    onSecondButtonClick,
    disableBackdropClick,
    disableEscapeKeyDown,
    customIcon,
    className = '',
    closeOnConfirm = true,
    isProcessing,
    submitId,
    checkboxMessage = '',
    onClose,
    confetti,
    confirmBtnElementName,
    cancelDataLumin,
    confirmDataLumin,
    hasCloseBtn = false,
    placement,
    priority = ModalPriority.MEDIUM,
    showOnlyInViewer = false,
    checkboxWrapperClassname = '',
    titleCentered = false,
    useReskinModal = false,
    confirmButtonProps = {},
    cancelButtonProps = {},
    Image,
    closeOnRouteChange,
    hideDefaultButtons = false,
    size = 'sm',
  },
}) {
  const { t } = useTranslation();
  const { drawConfetti } = useConfetti();
  const modalRef = useRef();
  const canvasRef = useRef();

  const tabletMatch = useTabletMatch();
  const { isViewer } = useViewerMatch();
  const isHitDocStackModal = type === ModalTypes.HIT_DOC_STACK;
  const open = isViewer && !isHitDocStackModal && !useReskinModal ? false : _open;
  const themeMode = useThemeMode();
  const { isEnableReskin } = useEnableWebReskin();
  const isLightMode = themeMode === THEME_MODE.LIGHT;
  const [isChecked, setIsChecked] = useState(false);
  const extendedButtonProps = confirmBtnElementName ? { 'data-lumin-btn-name': confirmBtnElementName } : {};

  useCloseModalOnRouteChange({
    opened: _open,
    close: closeModal,
    closeOnRouteChange,
  });

  function _handleCancelModal({ isCloseBtn = false }) {
    if (!isCloseBtn) {
      onCancel && onCancel(isChecked);
      onClose && onClose();
    } else {
      onClose && onClose(isCloseBtn);
    }
    closeModal();
  }

  function _renderPrimaryButtonContent() {
    if (isProcessing) {
      return <CircularLoading color="inherit" size={22} style={{ color: Colors.WHITE }} />;
    }

    return confirmButtonTitle || (type !== 'warning' ? t('common.ok') : t('common.delete'));
  }

  const onClickConfirmButton = async () => {
    if (onConfirm) {
      if (checkboxMessage.length) {
        await onConfirm(isChecked);
      } else {
        await onConfirm();
      }
    }
    if (closeOnConfirm) {
      closeModal();
    }
  };
  function renderPrimaryButton() {
    switch (confirmButtonType) {
      case 'button':
        return (
          <MultilingualButton
            className={`${color} ${isFullWidthButton ? BUTTON_FULL_CLASSES : ''}`}
            fullWidth
            loading={isProcessing}
            onClick={onClickConfirmButton}
            size={tabletMatch ? ButtonSize.XL : ButtonSize.MD}
            id={submitId}
            {...extendedButtonProps}
            {...confirmDataLumin}
            isLongText={confirmButtonTitle?.length > 18}
          >
            {_renderPrimaryButtonContent()}
          </MultilingualButton>
        );
      case 'link':
        return (
          <ButtonMaterial
            className={`${color} ${isFullWidthButton ? BUTTON_FULL_CLASSES : ''} ButtonMaterial--link`}
            onClick={closeModal}
            fullWidth
            disabled={isProcessing}
            {...extendedButtonProps}
            {...confirmDataLumin}
          >
            <Link to={href} onClick={() => !isProcessing} target="_blank">
              {_renderPrimaryButtonContent()}
            </Link>
          </ButtonMaterial>
        );
      default:
        return null;
    }
  }

  function _renderConfirmAndCancelModal() {
    return (
      <>
        {onCancel && (
          <ButtonMaterial
            color={cancelButtonColor}
            onClick={_handleCancelModal}
            disabled={isProcessing}
            fullWidth
            size={tabletMatch ? ButtonSize.XL : ButtonSize.MD}
            {...cancelDataLumin}
          >
            {cancelButtonTitle || t('common.cancel')}
          </ButtonMaterial>
        )}
        {renderPrimaryButton()}
      </>
    );
  }

  function _renderCustomModal() {
    return (
      <>
        <ButtonMaterial
          className={`MaterialButton__btn ${isFullWidthButton ? BUTTON_FULL_CLASSES : ''}`}
          disabled={isProcessing}
          onClick={() => {
            if (onFirstButtonClick) onFirstButtonClick();
            closeModal();
          }}
          color={isLightMode ? ButtonColor.PRIMARY_RED : ButtonColor.TERTIARY}
        >
          {firstButtonTitle}
        </ButtonMaterial>
        <ButtonMaterial
          className={`MaterialButton__btn ${isFullWidthButton ? BUTTON_FULL_CLASSES : ''}`}
          disabled={isProcessing}
          onClick={() => {
            if (onSecondButtonClick) onSecondButtonClick();
            closeModal();
          }}
          color={isLightMode ? ButtonColor.SECONDARY_RED : ButtonColor.PRIMARY_RED}
        >
          {secondButtonTitle}
        </ButtonMaterial>
      </>
    );
  }

  function renderModalContent() {
    if (isCustomModal) {
      return _renderCustomModal();
    }
    return _renderConfirmAndCancelModal();
  }

  function renderMessage() {
    if (boldMessage) {
      return (
        <div className="Container__Content--message">
          <span className="Container__Content--message-bold">{boldMessage}</span>
          <span>{message}</span>
        </div>
      );
    }

    return <div className="Container__Content--message">{message}</div>;
  }

  function renderCheckboxContent() {
    return checkboxMessage.length ? (
      <div className={classNames('Container__Content--checkbox-wrapper', checkboxWrapperClassname)}>
        <span>{checkboxMessage}</span>
        <Checkbox
          className="Container__Content--checkbox"
          type="checkbox"
          onChange={(e) => {
            const { checked } = e.target;
            if (checkboxMessage) {
              setIsChecked(checked);
            }
          }}
        />
      </div>
    ) : null;
  }

  const renderModalIconByType = () => {
    const modalType = isHitDocStackModal ? ModalTypes.FIRE : type;
    const specificSvgElement = {
      [ModalTypes.LUMIN]: (
        <Icomoon className="logo-2" size={36} color={Colors.SECONDARY_50} style={{ margin: '8px 0' }} />
      ),
      [ModalTypes.DRIVE]: (
        <SvgElement content="grant-drive-permission" className="auto-margin" width={75} alt="modal_image" />
      ),
      [ModalTypes.ONE_DRIVE]: (
        <SvgElement content="grant-one-drive-permission" className="auto-margin" width={75} alt="modal_image" />
      ),
    }[modalType];

    return specificSvgElement || <SvgElement content={`icon-${modalType}`} width={48} height={48} />;
  };

  const onSetRef = (node) => {
    modalRef.current = node;
    if (confetti && open && modalRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.classList.add('MaterialModal__canvas');
      modalRef.current.firstChild.after(canvasRef.current);

      drawConfetti(canvasRef.current);
    }
  };

  useEffect(
    () => () => {
      if (confetti && open && canvasRef.current) {
        canvasRef.current.remove();
        modalRef.current = null;
      }
    },
    [open, confetti]
  );

  useEffect(
    () => () => {
      if (open && showOnlyInViewer && !isViewer) {
        closeModal();
      }
    },
    [showOnlyInViewer, isViewer, open]
  );

  useEffect(
    () => () => {
      if (isChecked && !open) {
        setIsChecked(false);
      }
    },
    [open, isChecked]
  );

  const MODAL_WIDTH = tabletMatch ? 400 : 328;
  const { available } = useCheckModalAvailable();

  const getButtonClassNames = (buttonProps) => ({
    ...buttonProps.classNames,
    root: [styles.button, buttonProps.classNames?.root],
  });

  if (!open || (showOnlyInViewer && !isViewer)) {
    return null;
  }

  if (isEnableReskin && isHitDocStackModal && available) {
    return <InvitesToAddDocStackModal />;
  }

  if (isEnableReskin && useReskinModal) {
    return (
      <KiwiModal
        centered
        size={size}
        opened={open}
        title={title}
        zIndex={priority}
        message={message}
        type={Object.values(KiwiModalTypes).includes(type) ? type : ''}
        fullScreen={fullScreen}
        isProcessing={isProcessing}
        withCloseButton={hasCloseBtn}
        closeOnClickOutside={disableBackdropClick}
        closeOnEscape={disableEscapeKeyDown}
        fullWidthButton={isFullWidthButton}
        cancelButtonProps={{
          ...cancelButtonProps,
          classNames: getButtonClassNames(cancelButtonProps),
          disabled: cancelButtonProps.disabled || isProcessing,
          title: cancelButtonTitle || cancelButtonProps.title || t('common.cancel'),
          ...(isCustomModal ? { ...cancelDataLumin, ...extendedButtonProps } : {}),
          ...(cancelButtonProps.withExpandedSpace
            ? {
                classNames: {
                  root: styles.innerButton,
                },
              }
            : {}),
        }}
        confirmButtonProps={{
          ...confirmButtonProps,
          classNames: getButtonClassNames(confirmButtonProps),
          disabled: confirmButtonProps.disabled || isProcessing,
          title:
            confirmButtonTitle ||
            confirmButtonProps.title ||
            (type !== 'warning' ? t('common.ok') : t('common.delete')),
          ...(isCustomModal ? { ...confirmDataLumin, ...extendedButtonProps } : {}),
          ...(confirmButtonProps.withExpandedSpace
            ? {
                classNames: {
                  root: styles.innerButton,
                },
              }
            : {}),
        }}
        closeButtonProps={{
          onClick: () => hasCloseBtn && _handleCancelModal({ isCloseBtn: true }),
        }}
        overlayProps={{
          onClick: () => !disableBackdropClick && _handleCancelModal({ isCloseBtn: false }),
        }}
        onClose={() => {}}
        onConfirm={onClickConfirmButton}
        titleCentered={titleCentered}
        classNames={{
          content: styles.content,
          inner: styles.inner,
        }}
        {...(onCancel && {
          onCancel: () => _handleCancelModal({ isCloseBtn: false }),
        })}
        {...(type === ModalTypes.TADA && {
          Image: <Img src={TadaSvg} alt="tada" style={{ width: '88px', height: '80px' }} />,
        })}
        {...(isHitDocStackModal && {
          Image: (
            <Img
              width={107}
              height={84}
              src={isLightMode ? CreateTeamFailedImg : CreateTeamFailedDarkImg}
              alt="hit-doc-stack"
              style={{ display: 'block' }}
            />
          ),
        })}
        {...(Image && { Image })}
        hideDefaultButtons={hideDefaultButtons}
      >
        {!!checkboxMessage.length && (
          <KiwiCheckbox
            label={checkboxMessage}
            checked={isChecked}
            onChange={(e) => setIsChecked(e.currentTarget.checked)}
          />
        )}
      </KiwiModal>
    );
  }

  return (
    <Dialog
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown={disableEscapeKeyDown}
      fullScreen={fullScreen}
      placement={placement}
      open
      keepMounted
      onClose={_handleCancelModal}
      className={`theme-${isViewer ? themeMode : ''}`}
      width={MODAL_WIDTH}
      ref={onSetRef}
      hasCloseBtn={hasCloseBtn}
      priority={priority}
    >
      <div className={`MaterialDialog ${className}`}>
        <div className="Container">
          {customIcon || <div className="Container__Icon">{renderModalIconByType()}</div>}
          <div className="Container__Content">
            <div className="Container__Content--title">{title}</div>
            {renderMessage()}
            {renderCheckboxContent()}
            <div
              className={classNames('Container__Content--button', {
                'Container__button--full': isFullWidthButton,
                'Container__contentButton--noMargin': checkboxMessage,
              })}
            >
              {renderModalContent()}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

const mapStateToProps = (state) => ({
  modalData: selectors.getModalData(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeModal: () => dispatch(actions.closeModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(MaterialModal);

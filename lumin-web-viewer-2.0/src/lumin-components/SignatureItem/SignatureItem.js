/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Icomoon from 'lumin-components/Icomoon';
import SvgElement from 'lumin-components/SvgElement';

import { useTranslation } from 'hooks';

import { useSignatureCapacities } from 'features/Signature';

import styles from './SignatureItem.module.scss';
import './SignatureItem.scss';

const propTypes = {
  signatureIndex: PropTypes.number,
  signatureItem: PropTypes.object,
  activeSignatureIndex: PropTypes.number,
  deletingIndex: PropTypes.number,
  isCreatedFrame: PropTypes.bool,
  openCreateSignatureModal: PropTypes.func,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onDeleteSignature: PropTypes.func,
  isDisabled: PropTypes.bool,
  isOffline: PropTypes.bool,
  isLoading: PropTypes.bool,
  onMouseUp: PropTypes.func,
  onMouseDown: PropTypes.func,
  isDragging: PropTypes.bool,
  isDisabledDelete: PropTypes.bool,
};

const defaultProps = {
  signatureIndex: -1,
  activeSignatureIndex: -1,
  signatureItem: {},
  deletingIndex: 0,
  isCreatedFrame: false,
  openCreateSignatureModal: () => {},
  onClick: () => {},
  onDoubleClick: () => {},
  onDeleteSignature: () => {},
  isDisabled: false,
  isOffline: false,
  isLoading: false,
  onMouseUp: () => {},
  onMouseDown: () => {},
  isDragging: false,
  isDisabledDelete: false,
};

const SignatureItem = ({
  signatureIndex,
  signatureItem,
  activeSignatureIndex,
  deletingIndex,
  isCreatedFrame,
  openCreateSignatureModal,
  onClick,
  onDoubleClick,
  onDeleteSignature,
  isDisabled,
  isOffline,
  isLoading,
  onMouseUp,
  onMouseDown,
  isDragging,
  isDisabledDelete,
}) => {
  const { t } = useTranslation();
  const { isItemSyncing } = useSignatureCapacities();
  const [isDeleted, setIsDeleted] = useState(false);
  if (isDeleted) {
    return null;
  }
  if (isCreatedFrame) {
    return (
      <div
        className={classNames('SignatureItemWrapper SignatureItemWrapper--create', {
          'SignatureItemWrapper--disabled': isDisabled,
          'SignatureItemWrapper--loading': isLoading,
        })}
      >
        <div
          className={classNames('SignatureItemContainer SignatureItemContainer--create-sign', {
            'SignatureItemContainer--disabled': isDisabled,
          })}
          onClick={openCreateSignatureModal}
          role="button"
        >
          <div className="SignatureItemDetail SignatureItemDetail--create-sign">
            <Icomoon className="plus-circle" size={18} />
            <span className="label">{t('viewer.signatureOverlay.addSignature')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (isDragging) {
    return <div className="DraggingSignatureItem" />;
  }
  const onDelete = (e) => {
    setIsDeleted(true);
    onDeleteSignature(e);
  };

  const renderStatusConnection = () => {
    if (isOffline) {
      return <Icomoon className="no-internet" size={16} />;
    }
    if (signatureItem.remoteId) {
      return null;
    }
    if (isItemSyncing(signatureItem.status)) {
      return <Icomoon className={classNames('sync', styles.syncIcon)} size={16} />;
    }

    return <Icomoon className="offline-access" size={16} />;
  };

  const renderDeleteButton = () => {
    if (!isOffline || !signatureItem.remoteId) {
      return (
        <Icomoon
          className={classNames('cancel', {
            disabled: isDisabledDelete,
          })}
          size={13}
          onClick={onDelete}
        />
      );
    }
    return null;
  };

  const renderSignatureContent = () => {
    if (!signatureItem.imgSrc) {
      return <SvgElement content="crash" width={40} height={64} />;
    }

    return (
      <img
        src={signatureItem.imgSrc}
        alt="signature-item"
        className="SignatureItemDetail__SavedSign"
        loading="lazy"
        draggable={false}
      />
    );
  };

  return (
    <div
      className={classNames('SignatureItemWrapper', {
        'SignatureItemWrapper--disabled': isDisabled,
        'SignatureItemWrapper--loading': isLoading,
      })}
    >
      <div
        className={classNames('SignatureItemContainer', {
          'SignatureItemContainer--disabled': isDisabled || isLoading,
        })}
      >
        <div
          className={classNames('SignatureItemDetail SignatureItemDetail--detail', {
            selected: activeSignatureIndex === signatureIndex,
            'nonselect-border': activeSignatureIndex !== signatureIndex,
            blur: deletingIndex === signatureIndex,
          })}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          <div className={styles.iconContainer}>
            {renderStatusConnection()}
            {renderDeleteButton()}
          </div>
          {renderSignatureContent()}
        </div>
      </div>
    </div>
  );
};

SignatureItem.defaultProps = defaultProps;
SignatureItem.propTypes = propTypes;

export default SignatureItem;

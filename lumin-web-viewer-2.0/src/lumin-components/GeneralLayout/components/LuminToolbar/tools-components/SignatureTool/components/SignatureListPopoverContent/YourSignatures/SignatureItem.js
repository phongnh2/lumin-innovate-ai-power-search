/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import { pick } from 'lodash';
import PropTypes from 'prop-types';
import React, { forwardRef, useState } from 'react';
import { connect } from 'react-redux';

import IconButton from '@new-ui/general-components/IconButton';

import SvgElement from 'lumin-components/SvgElement';
import Icomoon from 'luminComponents/Icomoon';

import { useNetworkStatus } from 'hooks/useNetworkStatus';

import { useSignatureCapacities } from 'features/Signature';

import * as Styled from './YourSignatures.styled';

import styles from './SignatureItem.module.scss';

const SignatureItem = forwardRef(
  (
    { signatureItem, onClick, onDoubleClick, onDeleteSignature, onMouseUp, onMouseDown, isDisabledDelete, isDragging },
    ref
  ) => {
    const { canItemDelete, isItemSyncing, isItemDisabled } = useSignatureCapacities();
    const { isOffline } = useNetworkStatus();

    const [isDeleted, setIsDeleted] = useState(false);
    if (isDeleted) {
      return null;
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
        return <IconButton className={styles.syncingIcon} icon="sync" iconSize={16} size="medium" />;
      }

      return <IconButton icon="sm_cloud_problem" iconSize={16} size="medium" />;
    };

    const renderDeleteButton = () => {
      if (canItemDelete(pick(signatureItem, ['remoteId', 'status']))) {
        return (
          <Styled.CloseIconBtn
            onClick={onDelete}
            icon="sm_close"
            iconSize={16}
            size="medium"
            disabled={isDisabledDelete}
          />
        );
      }
      return null;
    };

    const renderSignatureContent = () => {
      if (!signatureItem.imgSrc) {
        return <SvgElement content="crash" width={40} />;
      }

      return <Styled.Img src={signatureItem.imgSrc} alt="signature-item" loading="lazy" draggable={false} />;
    };

    return (
      <Styled.SignatureItemWrapper
        $isDragging={isDragging}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        data-disabled={isItemDisabled({ status: signatureItem.status })}
        ref={ref}
        data-cy="signature_item"
      >
        <Styled.StatusWrapper>
          {renderStatusConnection()}
          {renderDeleteButton()}
        </Styled.StatusWrapper>

        {renderSignatureContent()}
      </Styled.SignatureItemWrapper>
    );
  }
);

SignatureItem.defaultProps = {
  signatureItem: {},
  onClick: () => {},
  onDoubleClick: () => {},
  onDeleteSignature: () => {},
  onMouseUp: () => {},
  onMouseDown: () => {},
  isDisabledDelete: false,
};

SignatureItem.propTypes = {
  isDragging: PropTypes.bool.isRequired,
  signatureItem: PropTypes.object,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onDeleteSignature: PropTypes.func,
  onMouseUp: PropTypes.func,
  onMouseDown: PropTypes.func,
  isDisabledDelete: PropTypes.bool,
};

const mapDispatchToProps = {};

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(SignatureItem);

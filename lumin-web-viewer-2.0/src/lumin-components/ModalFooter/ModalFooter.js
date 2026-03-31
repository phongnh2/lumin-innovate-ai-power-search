import classNames from 'classnames';
import { Button as KiwiButton } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import styles from './ModalFooter.module.scss';

const ModalFooter = ({
  label,
  onCancel,
  onSubmit,
  loading,
  disabled,
  disabledCancel,
  className,
  renderLeftElement,
  confirmButtonProps,
  cancelButtonProps,
  extraSpacing,
  cancelButtonLabel,
}) => {
  const { t } = useTranslation();
  const textSubmitButton = label || t('common.ok');
  const textCancelButton = cancelButtonLabel || t('common.cancel');

  return (
    <div
      className={classNames(styles.container, className)}
      data-has-left-element={!!renderLeftElement}
      data-extra-spacing={extraSpacing}
    >
      {renderLeftElement}
      <div className={styles.rightSection}>
        {onCancel && (
          <KiwiButton
            size="lg"
            variant="outlined"
            colorType="system"
            onClick={onCancel}
            disabled={disabledCancel}
            {...cancelButtonProps}
          >
            {textCancelButton}
          </KiwiButton>
        )}
        <KiwiButton
          size="lg"
          variant="filled"
          colorType="system"
          onClick={onSubmit}
          loading={loading}
          disabled={disabled}
          type="submit"
          {...confirmButtonProps}
        >
          {textSubmitButton}
        </KiwiButton>
      </div>
    </div>
  );
};

ModalFooter.propTypes = {
  label: PropTypes.string,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  disabledCancel: PropTypes.bool,
  smallGap: PropTypes.bool,
  className: PropTypes.string,
  isReskin: PropTypes.bool,
  renderLeftElement: PropTypes.node,
  confirmButtonProps: PropTypes.object,
  cancelButtonProps: PropTypes.object,
  extraSpacing: PropTypes.bool,
  cancelButtonLabel: PropTypes.string,
};

ModalFooter.defaultProps = {
  label: '',
  onCancel: null,
  onSubmit: () => {},
  loading: false,
  disabled: false,
  disabledCancel: false,
  smallGap: false,
  className: '',
  isReskin: false,
  renderLeftElement: null,
  confirmButtonProps: {},
  cancelButtonProps: {},
  extraSpacing: false,
  cancelButtonLabel: '',
};

export default ModalFooter;

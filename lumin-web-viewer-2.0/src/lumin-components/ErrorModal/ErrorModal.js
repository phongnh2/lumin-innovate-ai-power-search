import React, { useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'hooks';
import './ErrorModal.scss';

const ErrorModal = ({
  message, isDisabled, isOpen, showErrorMessage, closeElements,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      closeElements();
    }
  }, [isOpen]);

  useEffect(() => {
    const onError = (error) => {
      error = error.detail?.message || error.detail || error.message;
      let errorMessage;

      if (typeof error === 'string') {
        errorMessage = error;

        // provide a more specific error message
        if (errorMessage.includes('File does not exist')) {
          errorMessage = 'message.notSupported';
        }
      } else if (error.type === 'InvalidPDF') {
        errorMessage = 'message.badDocument';
      }

      if (errorMessage) {
        showErrorMessage(errorMessage);
      }
    };

    window.addEventListener('loaderror', onError);
    return () => window.removeEventListener('loaderror', onError);
  }, []);

  const shouldTranslate = message?.startsWith('message.');

  return isDisabled ? null : (
    <div
      className={classNames({
        Modal: true,
        ErrorModal: true,
        open: isOpen,
        closed: !isOpen,
      })}
      data-element="errorModal"
    >
      <div className="container">{shouldTranslate ? t(message) : message}</div>
    </div>
  );
};

ErrorModal.propTypes = {
  message: PropTypes.string,
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  showErrorMessage: PropTypes.func,
  closeElements: PropTypes.func,
};

ErrorModal.defaultProps = {
  message: '',
  isDisabled: false,
  isOpen: false,
  showErrorMessage: () => {},
  closeElements: () => {},
};
export default ErrorModal;

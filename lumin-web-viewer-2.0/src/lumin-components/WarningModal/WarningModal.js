import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import core from 'core';

import Button from 'luminComponents/Button';

import getClassName from 'helpers/getClassName';
import getPopupElements from 'helpers/getPopupElements';

import './WarningModal.scss';

class WarningModal extends React.PureComponent {
  componentDidMount() {
    core.addEventListener('documentUnloaded', this.onCancel);
  }

  componentDidUpdate(prevProps) {
    const { isOpen, closeElements } = this.props;

    if (!prevProps.isOpen && isOpen) {
      closeElements(getPopupElements());
    }
  }

  componentWillUnmount() {
    core.removeEventListener('documentUnloaded', this.onCancel);
  }

  onCancel = () => {
    // fire cancel event from 'componentDidUpdate'
    if (this.props.onCancel) {
      this.props.onCancel().then(() => {
        this.props.closeElement('warningModal');
      });
    } else {
      this.props.closeElement('warningModal');
    }
  };

  onConfirm = () => {
    this.props.onConfirm().then(() => {
      this.props.closeElement('warningModal');
    });
  };

  render() {
    const { title, message, confirmBtnText, t } = this.props;

    if (this.props.isDisabled) {
      return null;
    }

    const className = getClassName('Modal WarningModal', this.props);
    const label = confirmBtnText || t('action.ok');

    const cancelBtnText = t('action.cancel');

    return (
      <div className={className}>
        <div className="container">
          <div className="header">{title}</div>
          <div className="body">{message}</div>
          <div className="footer">
            <Button dataElement="WarningModalClearButton" label={cancelBtnText} onClick={this.onCancel} />
            <Button className="warningMessageConfirm" dataElement="WarningModalSignButton" label={label} onClick={this.onConfirm} />
          </div>
        </div>
      </div>
    );
  }
}
WarningModal.propTypes = {
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  closeElement: PropTypes.func.isRequired,
  closeElements: PropTypes.func.isRequired,
  confirmBtnText: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  t: PropTypes.func,
};

WarningModal.defaultProps = {
  isDisabled: false,
  isOpen: false,
  confirmBtnText: 'comfirm',
  title: 'title',
  message: 'message',
  onConfirm: () => {},
  onCancel: () => {},
  t: () => {},
};
export default withTranslation()(WarningModal);

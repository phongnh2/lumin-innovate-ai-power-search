import React from 'react';
import PropTypes from 'prop-types';

import getClassName from 'helpers/getClassName';
import LoadingLogo from 'lumin-components/LoadingLogo';
import './LoadingModal.scss';

const propTypes = {
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  closeElements: PropTypes.func.isRequired,
  themeMode: PropTypes.string,
};

const defaultProps = {
  isOpen: false,
  isDisabled: false,
  themeMode: 'light',
};

class LoadingModal extends React.PureComponent {
  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements(['signatureModal', 'printModal', 'errorModal']);
    }
  }

  render() {
    if (this.props.isDisabled) {
      return null;
    }
    const { themeMode } = this.props;

    const isInViewer = window.location.pathname.startsWith('/viewer/');
    const themeLoading = isInViewer ? (`theme-${themeMode}`) : '';

    const className = getClassName(`Modal LoadingModal ${themeLoading}`, this.props);

    return (
      <div className={className} data-element="loadingModal">
        <LoadingLogo />
      </div>
    );
  }
}

LoadingModal.propTypes = propTypes;
LoadingModal.defaultProps = defaultProps;

export default LoadingModal;

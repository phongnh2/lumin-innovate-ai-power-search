import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import onClickOutside from 'react-onclickoutside';
import { connect } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ActionButton from 'luminComponents/ActionButton';

import { isIOS } from 'helpers/device';
import downloadPdf from 'helpers/downloadPdf';
import getClassName from 'helpers/getClassName';
import getOverlayPositionBasedOn from 'helpers/getOverlayPositionBasedOn';
import openFilePicker from 'helpers/openFilePicker';
import { print } from 'helpers/print';

import { toggleFullScreenMode } from 'features/FullScreen/helpers/toggleFullScreenMode';

import { workerTypes } from 'constants/types';

import './MenuOverlay.scss';

class MenuOverlay extends React.PureComponent {
  constructor() {
    super();
    this.overlay = React.createRef();
    this.state = {
      left: 0,
      right: 'auto',
      documentType: null,
    };
  }

  componentDidMount() {
    core.addEventListener('documentLoaded', this.onDocumentLoaded);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements(['groupOverlay', 'viewControlsOverlay', 'toolStylePopup', 'signatureOverlay', 'zoomOverlay', 'redactionOverlay']);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(getOverlayPositionBasedOn('menuButton', this.overlay));
    }
  }

  componentWillUnmount() {
    core.removeEventListener('documentLoaded', this.onDocumentLoaded);
  }

  onDocumentLoaded = () => {
    this.setState({
      documentType: core.getDocument().getType(),
    });
  };

  handlePrintButtonClick = () => {
    const { dispatch, isEmbedPrintSupported } = this.props;
    this.props.closeElements(['menuOverlay']);
    const printOptions = {
      allPages: true,
      includeAnnotations: true,
      printQuality: 3,
      maintainPageOrientation: true,
    };
    print(dispatch, isEmbedPrintSupported, printOptions);
  };

  downloadDocument = () => {
    downloadPdf(this.props.dispatch);
  };

  render() {
    const { left, right, documentType } = this.state;
    const { isDisabled, isFullScreen, t } = this.props;

    if (isDisabled) {
      return null;
    }

    const className = getClassName('Overlay MenuOverlay', this.props);

    return (
      <div className={className} data-element="menuOverlay" style={{ left, right }} ref={this.overlay}>
        <ActionButton dataElement="filePickerButton" label={t('action.openFile')} onClick={openFilePicker} />
        {!isIOS &&
          <ActionButton dataElement="fullScreenButton" label={isFullScreen ? t('action.exitFullscreen') : t('action.enterFullscreen')} onClick={toggleFullScreenMode} />}
        {documentType !== workerTypes.XOD &&
          <ActionButton dataElement="downloadButton" label={t('action.download')} onClick={this.downloadDocument} />}
        <ActionButton dataElement="printButton" label={t('action.print')} onClick={this.handlePrintButtonClick} hidden={['mobile']} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isEmbedPrintSupported: selectors.isEmbedPrintSupported(state),
  isFullScreen: selectors.isFullScreen(state),
  isDisabled: selectors.isElementDisabled(state, 'menuOverlay'),
  isOpen: selectors.isElementOpen(state, 'menuOverlay'),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  closeElements: (dataElements) => dispatch(actions.closeElements(dataElements)),
});
MenuOverlay.propTypes = {
  isEmbedPrintSupported: PropTypes.bool,
  isFullScreen: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  closeElements: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

MenuOverlay.defaultProps = {
  isEmbedPrintSupported: false,
  isFullScreen: false,
  isDisabled: false,
  isOpen: false,
};
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(onClickOutside(MenuOverlay)));

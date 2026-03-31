/* eslint-disable import/no-unresolved */
import React from 'react';
import PropTypes from 'prop-types';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import classNames from 'classnames';

import './ViewerWhatsNewModal.scss';

const propTypes = {
  isOpenModal: PropTypes.bool,
  logo: PropTypes.string,
  content: PropTypes.string,
  closeModal: PropTypes.func,
  onClickStartGuide: PropTypes.func,
};

const defaultProps = {
  isOpenModal: false,
  logo: '',
  content: '',
  closeModal: () => {},
  onClickStartGuide: () => {},
};

function ViewerWhatsNewModal(props) {
  const {
    logo, content, closeModal, onClickStartGuide, isOpenModal,
  } = props;

  return (
    <div
      className={classNames({
        Modal: true,
        ViewerWhatsNewModal: true,
        open: isOpenModal,
        closed: !isOpenModal,
      })}
      data-element="viewerWhatsNewsModal"
    >
      <div className="ViewerWhatsNewModal-container">
        <div className="ViewerWhatsNewModal-header">
          <img src={logo} />
          <span className="text-header">What's New?</span>
        </div>
        <div className="ViewerWhatsNewModal-content">
          <span className="text-content">{content}</span>
        </div>
        <div className="ViewerWhatsNewModal-footer">
          <ButtonMaterial
            className="secondary"
            onClick={closeModal}
          >
            No, thanks
          </ButtonMaterial>
          <ButtonMaterial className="primary" onClick={onClickStartGuide}>
            Show me
          </ButtonMaterial>
        </div>
      </div>
    </div>
  );
}

ViewerWhatsNewModal.propTypes = propTypes;
ViewerWhatsNewModal.defaultProps = defaultProps;

export default ViewerWhatsNewModal;

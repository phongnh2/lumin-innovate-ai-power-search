import React from 'react';
import PropTypes from 'prop-types';

import Dialog from 'luminComponents/Dialog';
import ButtonMaterial from 'luminComponents/ButtonMaterial';

import AnnouncementImage from '../../../assets/images/announcement.png';

import './AnnouncementModal.scss';

const propTypes = {
  onClose: PropTypes.func,
};

const defaultProps = {
  onClose: () => {},
};

const AnnouncementModal = (props) => {
  const { onClose } = props;
  return (
    <Dialog
      open
      onClose={onClose}
      className="AnnouncementModal"
    >
      <div className="AnnouncementModal__container">
        <img className="AnnouncementModal__image" src={AnnouncementImage} />
        <div className="AnnouncementModal__title">You are using the new version of Lumin now</div>
        <div className="AnnouncementModal__message">
          All your documents till <span>31/05/2019</span> and your subscription are transferred to this new version.
        </div>
        <ButtonMaterial className="primary" onClick={onClose}>
          I got it!
        </ButtonMaterial>
      </div>
    </Dialog>
  );
};

AnnouncementModal.propTypes = propTypes;
AnnouncementModal.defaultProps = defaultProps;

export default AnnouncementModal;

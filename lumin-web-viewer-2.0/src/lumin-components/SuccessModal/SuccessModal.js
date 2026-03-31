import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'luminComponents/Dialog';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import SvgElement from 'luminComponents/SvgElement';
import Icomoon from 'lumin-components/Icomoon';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';

import { useTabletMatch } from 'hooks';
import { Colors } from 'constants/styles';
import './SuccessModal.scss';

const propTypes = {
  open: PropTypes.bool,
  icon: PropTypes.string,
  confirmMessage: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  buttonGroup: PropTypes.node,
  handleCloseModal: PropTypes.func,
  isHideBg: PropTypes.bool,
  isFullWidthButton: PropTypes.bool,
};

const defaultProps = {
  open: false,
  isHideBg: false,
  icon: 'logo-2',
  confirmMessage: 'OK',
  title: '',
  message: '',
  buttonGroup: null,
  handleCloseModal: () => {},
  isFullWidthButton: false,
};

const SuccessModal = ({
  open,
  title,
  message,
  isHideBg,
  icon,
  confirmMessage,
  buttonGroup,
  handleCloseModal,
  isFullWidthButton,
}) => {
  const isTabletUp = useTabletMatch();

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      className="SuccessModal"
      width={600}
    >
      <>
        <SvgElement
          className={`SuccessModal__bg ${isHideBg && 'hide'}`}
          content="bg_modal_purchase"
          width="552px"
          height="auto"
        />
        <div className="SuccessModal__Container">
          <div className="Container__Icon">
            <Icomoon className={icon} size={36} color={Colors.SECONDARY_50} style={{ margin: '8px 0' }} />
          </div>
          <div className="Container__Content">
            <div className="Container__Content--title">{title}</div>
            <div className="Container__Content--message">
              <p>{message}</p>
            </div>
            <div className="Container__Content--button">
              {buttonGroup || (
              <ButtonMaterial
                size={isTabletUp ? ButtonSize.XL : ButtonSize.MD}
                className={`primary ${isFullWidthButton ? 'SuccessModal__btn--full' : 'SuccessModal__btn'}`}
                onClick={handleCloseModal}
              >
                {confirmMessage}
              </ButtonMaterial>
              )}
            </div>
          </div>
        </div>
      </>
    </Dialog>
  );
};

SuccessModal.propTypes = propTypes;
SuccessModal.defaultProps = defaultProps;

export default SuccessModal;

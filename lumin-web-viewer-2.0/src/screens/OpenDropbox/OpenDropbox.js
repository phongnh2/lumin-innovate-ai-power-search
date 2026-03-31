/* eslint-disable class-methods-use-this */
import React from 'react';
import PropTypes from 'prop-types';
import AdSense from 'react-adsense';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

import SvgElement from 'luminComponents/SvgElement';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { isMobile } from 'helpers/device';
import actions from 'actions';
import { validator } from 'utils';
import selectors from 'selectors';

import './OpenDropbox.scss';

class OpenDropbox extends React.Component {
  _handleLoginDropbox = () => {
    localStorage.removeItem('token-dropbox');
    window.location.replace('https://www.dropbox.com/logout');
  };

  render() {
    const { currentUser, t } = this.props;
    const isUserPremium = currentUser && validator.validatePremiumUser(currentUser);
    const errorMessage = t('openDropbox.errorMessage');

    return (
      <div className="OpenDropbox">
        {!isUserPremium && (
          <div className="OpenDropbox__ad">
            <AdSense.Google
              client="ca-pub-1510942265317514"
              slot="3631572891"
              style={{ display: 'block' }}
              layout="in-article"
              format="fluid"
              responsive="true"
            />
          </div>
        )}
        <div
          className={`OpenDropbox__container ${isUserPremium ? 'premium' : ''}`}
        >
          {!isUserPremium && !isMobile() && (
            <div className="Document__ad">
              <AdSense.Google
                client="ca-pub-1510942265317514"
                slot="3631572891"
                style={{ width: 160, height: 600, display: 'block' }}
                format="auto"
                responsive="true"
              />
            </div>
          )}
          <div className="OpenDropbox__content-container">
            <div className="OpenDropbox__content">
              <div className="OpenDropbox__title">
                {t('openDropbox.needsAccessToDropboxToOpenFile')}
              </div>
              <div className="OpenDropbox__img">
                <SvgElement content="open-dropbox-transfer" width="100%" />
              </div>
              <div
                className={`OpenDropbox__message${
                  errorMessage.length ? '--error' : ''
                }`}
              >
                {errorMessage}
              </div>
              <ButtonMaterial
                onClick={this._handleLoginDropbox}
                className="primary button OpenDropbox__btn"
              >
                {t('openDropbox.connectToDropbox')}
              </ButtonMaterial>
            </div>
            <p className="OpenDropbox__policy">{t('openDropbox.clickingConnectToDropbox')}</p>
          </div>
          {!isUserPremium && !isMobile() && (
            <div className="Document__ad">
              <AdSense.Google
                client="ca-pub-1510942265317514"
                slot="3631572891"
                style={{ width: 160, height: 600, display: 'block' }}
                format="auto"
                responsive="true"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

OpenDropbox.propTypes = {
  currentUser: PropTypes.object,
  t: PropTypes.func.isRequired,
};

OpenDropbox.defaultProps = {
  currentUser: {},
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  setCurrentUser: (currentUser) => dispatch(actions.setCurrentUser(currentUser)),
});

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(OpenDropbox);

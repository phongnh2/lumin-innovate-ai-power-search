import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import selectors from 'selectors';

import { signature } from 'utils';

import { MAXIMUM_NUMBER_SIGNATURE } from 'constants/lumin-common';

import * as Styled from './CreateSignatureModalContent.styled';

export const Header = ({ currentUser, currentDocument }) => {
  const { t } = useTranslation();
  const numberSignature = signature.getNumberOfSignatures(currentUser);
  const { premiumToolsInfo } = currentDocument;
  const maximumNumberSignature = get(premiumToolsInfo, 'maximumNumberSignature', MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN);

  return (
    <Styled.ModalTitle>
      {t('viewer.signatureModal.createNewSignature')}{' '}
      <span>
        {`(${numberSignature}/${numberSignature > maximumNumberSignature ? numberSignature : maximumNumberSignature})`}
      </span>
    </Styled.ModalTitle>
  );
};

Header.propTypes = {
  currentDocument: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Header);

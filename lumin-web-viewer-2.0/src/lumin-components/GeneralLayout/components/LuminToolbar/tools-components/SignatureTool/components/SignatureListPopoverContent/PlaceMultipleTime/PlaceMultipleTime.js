import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import FormControlLabel from '@new-ui/general-components/FormControlLabel';

import actions from 'actions';
import selectors from 'selectors';

import Checkbox from 'lumin-components/GeneralLayout/general-components/Checkbox';

import { useTranslation } from 'hooks';

import { FORM_INPUT_NAME } from 'utils/Factory/EventCollection/FormEventCollection';

import { LocalStorageKey } from 'constants/localStorageKey';

import * as Styled from './PlaceMultipleTime.styled';

const PlaceMultipleTime = ({ isPlacingMultipleSignatures, signatureWidgetSelected, setPlacingMultipleSignatures }) => {
  const { t } = useTranslation();

  const handleClickCheckbox = () => {
    localStorage.setItem(LocalStorageKey.IS_PLACING_MULTIPLE_SIGNATURES, !isPlacingMultipleSignatures);
    setPlacingMultipleSignatures(!isPlacingMultipleSignatures);
  };

  return (
    <Styled.Container>
      <FormControlLabel
        control={
          <Checkbox
            type="checkbox"
            className="checkbox"
            name={FORM_INPUT_NAME.PLACE_MULTIPLE_SIGNATURES}
            data-lumin-form-name={FORM_INPUT_NAME.PLACE_MULTIPLE_SIGNATURES}
            onChange={handleClickCheckbox}
            checked={isPlacingMultipleSignatures}
            disabled={Boolean(signatureWidgetSelected)}
          />
        }
        label={t('common.placeSignatureMultipleTimes')}
      />
    </Styled.Container>
  );
};

PlaceMultipleTime.propTypes = {
  isPlacingMultipleSignatures: PropTypes.bool.isRequired,
  signatureWidgetSelected: PropTypes.any,
  setPlacingMultipleSignatures: PropTypes.func.isRequired,
};

PlaceMultipleTime.defaultProps = {
  signatureWidgetSelected: null,
};

const mapStateToProps = (state) => ({
  isPlacingMultipleSignatures: selectors.isPlacingMultipleSignatures(state),
  signatureWidgetSelected: selectors.signatureWidgetSelected(state),
});

const mapDispatchToProps = (dispatch) => ({
  setPlacingMultipleSignatures: (args) => dispatch(actions.setPlacingMultipleSignatures(args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PlaceMultipleTime);

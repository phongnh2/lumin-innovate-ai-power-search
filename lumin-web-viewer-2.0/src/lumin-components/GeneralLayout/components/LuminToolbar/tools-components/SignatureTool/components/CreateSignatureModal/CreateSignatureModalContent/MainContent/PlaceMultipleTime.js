import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import FormControlLabel from '@new-ui/general-components/FormControlLabel';

import actions from 'actions';
import selectors from 'selectors';

import Checkbox from 'lumin-components/GeneralLayout/general-components/Checkbox';

import { useTranslation } from 'hooks';

import { FORM_INPUT_NAME } from 'utils/Factory/EventCollection/FormEventCollection';

import { LocalStorageKey } from 'constants/localStorageKey';

export const FormControlLabelStyled = styled(FormControlLabel)`
  margin-top: 8px;
`;

const PlaceMultipleTime = ({ isPlacingMultipleSignatures, signatureWidgetSelected, setPlacingMultipleSignatures }) => {
  const { t } = useTranslation();

  const handleClickCheckbox = () => {
    localStorage.setItem(LocalStorageKey.IS_PLACING_MULTIPLE_SIGNATURES, !isPlacingMultipleSignatures);
    setPlacingMultipleSignatures(!isPlacingMultipleSignatures);
  };

  return (
    <FormControlLabelStyled
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
  );
};

const mapDispatchToProps = (dispatch) => ({
  setPlacingMultipleSignatures: (args) => dispatch(actions.setPlacingMultipleSignatures(args)),
});

const mapStateToProps = (state) => ({
  signatureWidgetSelected: selectors.signatureWidgetSelected(state),
  isPlacingMultipleSignatures: selectors.isPlacingMultipleSignatures(state),
});

PlaceMultipleTime.propTypes = {
  setPlacingMultipleSignatures: PropTypes.func.isRequired,
  signatureWidgetSelected: PropTypes.any,
  isPlacingMultipleSignatures: PropTypes.bool.isRequired,
};

PlaceMultipleTime.defaultProps = {
  signatureWidgetSelected: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaceMultipleTime);

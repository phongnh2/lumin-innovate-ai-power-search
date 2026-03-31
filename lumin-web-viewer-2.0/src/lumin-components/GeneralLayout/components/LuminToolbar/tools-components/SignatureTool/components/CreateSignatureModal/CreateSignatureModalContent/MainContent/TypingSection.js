/* eslint-disable import/no-cycle */
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { MAX_INPUT_FIELD_LENGTH, DEFAULT_INPUT_COLOR, LARGE_FONTS } from './constants';
import { CreateSignatureModalContentContext } from './CreateSignatureModalContentContext';
import { convertPtToFontWeight } from './utils';

import * as Styled from './MainContent.styled';

const TypingSection = ({ activeToolStyles }) => {
  const { setTextSignature, textSignature, signatureFont, errorTextSignature } = useContext(
    CreateSignatureModalContentContext
  );
  const { StrokeColor, Opacity, StrokeThickness } = activeToolStyles;
  const { t } = useTranslation();
  const shouldReduceDefaultFontsize = LARGE_FONTS.includes(signatureFont);

  return (
    <Styled.TypingSection>
      <Styled.InputWrapper>
        <Styled.Input
          type="text"
          placeholder={t('viewer.signatureModal.typeYourSignatureHere')}
          style={{
            '--placeholder-font-size': shouldReduceDefaultFontsize ? '24px' : '48px',
            fontFamily: `"${signatureFont}", cursive`,
            fontWeight: convertPtToFontWeight(StrokeThickness),
            color: StrokeColor
              ? `rgba(${StrokeColor.R},${StrokeColor.G},${StrokeColor.B},${Opacity})`
              : DEFAULT_INPUT_COLOR,
          }}
          onChange={setTextSignature}
          value={textSignature}
        />
        <Styled.MsgWraper>
          {errorTextSignature ? (
            <Styled.ErrorMsg className="error-message">{errorTextSignature}</Styled.ErrorMsg>
          ) : (
            <span />
          )}
          <Styled.Desc>{`${textSignature.length}/${MAX_INPUT_FIELD_LENGTH}`}</Styled.Desc>
        </Styled.MsgWraper>
      </Styled.InputWrapper>
    </Styled.TypingSection>
  );
};

TypingSection.propTypes = {
  activeToolStyles: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  activeToolStyles: selectors.getActiveToolStyles(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(TypingSection);

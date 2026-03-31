import PropTypes from 'prop-types';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks';

import annotationColorMapKey from 'constants/annotationColorMapKey';
import { ANNOTATION_STYLE } from 'constants/documentConstants';
import { THEME_MODE } from 'constants/lumin-common';

import {
  StyledTransparenccyButton, StyledSpan, theme,
} from './TransparencyCell.styled';

TransparencyCell.propTypes = {
  property: PropTypes.string,
  setColor: PropTypes.func.isRequired,
  active: PropTypes.string,
  className: PropTypes.string,
  isNotRenderTransparencyCell: PropTypes.bool,
  isTextFieldPalette: PropTypes.bool,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
};

TransparencyCell.defaultProps = {
  property: '',
  active: '',
  className: '',
  isNotRenderTransparencyCell: false,
  themeMode: THEME_MODE.LIGHT,
  isTextFieldPalette: false,
};

function TransparencyCell({
  property, setColor, active, className, isNotRenderTransparencyCell, themeMode, isTextFieldPalette
}) {
  const shouldRenderDummyCell =
    isNotRenderTransparencyCell ||
    [ANNOTATION_STYLE.TEXT_COLOR, annotationColorMapKey.REDACTION].includes(property) ||
    (property === ANNOTATION_STYLE.STROKE_COLOR && !isTextFieldPalette);
  const themeModeProvider = theme[themeMode];
  const { t } = useTranslation();

  if (shouldRenderDummyCell) {
    return null;
  }

  return (
    <ThemeProvider theme={themeModeProvider}>
      <StyledTransparenccyButton
        disableRipple
        onClick={(e) => setColor(e)}
        className={`${className} ${active}`}
      >
        {active && <Icomoon className="check" size={14} />}
        <StyledSpan className={`${active}`}>{t('viewer.noteContent.noColor')}</StyledSpan>
      </StyledTransparenccyButton>
    </ThemeProvider>
  );
}

export default TransparencyCell;

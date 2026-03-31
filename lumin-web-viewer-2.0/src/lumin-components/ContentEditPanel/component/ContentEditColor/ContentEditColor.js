import PropTypes from 'prop-types';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import ColorPaletteLumin from 'lumin-components/ColorPaletteLumin';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useThemeMode, useTranslation } from 'hooks';

import annotationColorMapKey from 'constants/annotationColorMapKey';
import { ANNOTATION_STYLE } from 'constants/documentConstants';

import { StyledTabLabelContent, theme } from '../../ContentEditPanel.styled';

const DEFAULT_COLOR = new window.Core.Annotations.Color('#000000');
function ContentEditColor(props) {
  const { disabled, handleColorChange, format, isOpenRightToolPanel } = props;
  const { t } = useTranslation();
  const themeMode = useThemeMode();

  return (
    <ThemeProvider theme={theme[themeMode]}>
      <div>
        <StyledTabLabelContent>{t('viewer.contentEditPanel.colors')}</StyledTabLabelContent>
        <Tooltip title={disabled ? t('viewer.contentEditPanel.tooltipContent') : ''}>
          <div>
            <ColorPaletteLumin
              color={disabled ? DEFAULT_COLOR : format.color || DEFAULT_COLOR}
              property={ANNOTATION_STYLE.TEXT_COLOR}
              onStyleChange={handleColorChange}
              colorMapKey={annotationColorMapKey.CONTENT_EDIT}
              disabled={disabled}
              isOpenRightToolPanel={isOpenRightToolPanel}
            />
          </div>
        </Tooltip>
      </div>
    </ThemeProvider>
  );
}

ContentEditColor.propTypes = {
  format: PropTypes.object,
  handleColorChange: PropTypes.func,
  disabled: PropTypes.bool,
  isOpenRightToolPanel: PropTypes.bool,
};

ContentEditColor.defaultProps = {
  format: {},
  disabled: true,
  handleColorChange: () => {},
  isOpenRightToolPanel: false,
};

export default ContentEditColor;

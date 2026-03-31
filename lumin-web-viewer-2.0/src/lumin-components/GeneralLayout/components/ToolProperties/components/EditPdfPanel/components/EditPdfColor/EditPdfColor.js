import PropTypes from 'prop-types';
import React from 'react';

import ColorPalette from 'lumin-components/GeneralLayout/general-components/ColorPalette';
import Tooltip from 'lumin-components/GeneralLayout/general-components/Tooltip';

import { useTranslation } from 'hooks';

import { CONTENT_EDIT_COLOR_BASE } from 'constants/contentEditTool';

import * as Styled from '../../EditPdfPanel.styled';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 1)';

function EditPdfColor(props) {
  const { disabled, handleColorChange, format } = props;
  const { color } = format;
  const { t } = useTranslation();

  return (
    <Styled.EditPdfColorWrapper>
      <Styled.SubTitle>{t('viewer.contentEditPanel.colors')}</Styled.SubTitle>
      <Tooltip title={disabled ? t('viewer.contentEditPanel.tooltipContent') : ''}>
        <div>
          <ColorPalette
            options={CONTENT_EDIT_COLOR_BASE}
            value={color ? color.toString() : DEFAULT_COLOR}
            disabled={disabled}
            onChange={handleColorChange}
          />
        </div>
      </Tooltip>
    </Styled.EditPdfColorWrapper>
  );
}

EditPdfColor.propTypes = {
  format: PropTypes.object,
  handleColorChange: PropTypes.func,
  disabled: PropTypes.bool,
};

EditPdfColor.defaultProps = {
  format: {},
  disabled: false,
  handleColorChange: () => {},
};

export default EditPdfColor;

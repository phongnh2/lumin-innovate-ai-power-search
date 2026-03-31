import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Icomoon from 'lumin-components/Icomoon';
import ModalFooter from 'lumin-components/ModalFooter';
import Tooltip from 'lumin-components/Shared/Tooltip';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { Colors } from 'constants/styles';
import { useTabletMatch, useTranslation } from 'hooks';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import * as Styled from './ButtonAddColor.styled';

const MIN_COLOR_PICKER_HEIGHT = 292;

const ColorPicker = lazyWithRetry(() => import('lumin-components/Shared/ColorPicker'), {
  fallback: <div style={{ minHeight: MIN_COLOR_PICKER_HEIGHT }} />,
});

const DEFAULT_COLOR = '#FF5555';

function ButtonAddColor({ onColorPick, hasReachedMaximumColors }) {
  const anchorEl = useRef();
  const isTabletMatch = useTabletMatch();
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const closePopper = () => {
    setOpen(false);
  };

  const selectColor = async () => {
    try {
      setLoading(true);
      await onColorPick(color);
      closePopper();
    } finally {
      setLoading(false);
    }
  };
  const openPicker = () => {
    setOpen((prevState) => !prevState);
  };

  const onChangeColor = (pickedColor) => {
    setColor(pickedColor.hex);
  };

  const colorPickerWidth = isTabletMatch ? (340 - 48) : (328 - 32);

  return (
    <>
      <Tooltip title={hasReachedMaximumColors ? t('modalFolder.numberOfColorsReachesTheLimit') : ''}>
        <Styled.ButtonAddWrapper>
          <Styled.ButtonAdd
            disabled={hasReachedMaximumColors}
            ref={anchorEl}
            onClick={openPicker}
            color={ButtonColor.SECONDARY_BLACK}
          >
            <Icomoon
              className="plus-thin"
              size={16}
              color={hasReachedMaximumColors ? Colors.NEUTRAL_40 : Colors.NEUTRAL_60}
            />
          </Styled.ButtonAdd>
        </Styled.ButtonAddWrapper>
      </Tooltip>

      {open && (
        <Styled.Popper
          parentOverflow="viewport"
          handleClose={closePopper}
          disablePortal={false}
          open
          placement="bottom-start"
          anchorEl={anchorEl.current}
        >
          <Styled.PopperChildWrapper>
            <ColorPicker width={colorPickerWidth} color={color} onChange={onChangeColor} />
            <Styled.Footer>
              <ModalFooter
                onCancel={closePopper}
                label={t('common.confirm')}
                onSubmit={selectColor}
                loading={loading}
                smallGap
              />
            </Styled.Footer>
          </Styled.PopperChildWrapper>
        </Styled.Popper>
      )}
    </>
  );
}

ButtonAddColor.propTypes = {
  onColorPick: PropTypes.func.isRequired,
  hasReachedMaximumColors: PropTypes.bool,
};

ButtonAddColor.defaultProps = {
  hasReachedMaximumColors: false,
};

export default React.memo(ButtonAddColor);

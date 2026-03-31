import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Popper from '@new-ui/general-components/Popper';

import selectors from 'selectors';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import SvgElement from 'lumin-components/SvgElement';

import { convertColorObject } from 'helpers/convertColorObject';

import { DataElements } from 'constants/dataElement';

import * as Styled from './ColorPickerCell.styled';

const ColorPickerCell = ({
  disablePortal = false,
  setPalette = () => {},
  initialColor = new window.Core.Annotations.Color(0, 0, 0, 1),
}) => {
  const { t } = useTranslation();
  const ref = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [color, setColor] = useState(convertColorObject(initialColor));
  const isToolbarPopoverOpened = useSelector((state) => selectors.isElementOpen(state, DataElements.TOOLBAR_POPOVER));

  const handleChange = ({ rgb }) => {
    setColor(rgb);
  };

  const handleSetPalette = () => {
    if (color) {
      setPalette(`rgba(${color.r}, ${color.g}, ${color.b}, 1)`);
    }
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePicker = () => {
    setAnchorEl(null);
  };

  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

  return (
    <>
      <IconButton onClick={handleClick} ref={ref}>
        <SvgElement content="color-picker" width={24} height={24} />
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePicker}
        {...((disablePortal || isToolbarPopoverOpened) && {
          disablePortal: true,
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                boundary: 'viewport',
              },
            },
          ],
        })}
      >
        <Styled.PopperContainer>
          <Styled.ChromePickerContainer
            className="ChromePicker"
            disableAlpha
            color={color}
            width="auto"
            onChangeComplete={handleChange}
            styles={{
              default: {
                picker: { boxShadow: 'none', borderRadius: 8 },
                body: {
                  padding: '16px 0',
                },
              },
            }}
          />
          <div>
            <Styled.PopperAction>
              <Button onClick={handleClosePicker} variant="outlined">
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSetPalette} variant="filled">
                {t('common.confirm')}
              </Button>
            </Styled.PopperAction>
          </div>
        </Styled.PopperContainer>
      </Popper>
    </>
  );
};

ColorPickerCell.propTypes = {
  disablePortal: PropTypes.bool,
  setPalette: PropTypes.func,
  initialColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default ColorPickerCell;

import React from 'react';
import styled from 'styled-components';

import IconButton from '@new-ui/general-components/IconButton';
import Popper from '@new-ui/general-components/Popper';
import PopperState from '@new-ui/general-components/PopperState';

import ColorPaletteLumin from 'lumin-components/ColorPaletteLumin';

import annotationColorMapKey from 'constants/annotationColorMapKey';
import { ANNOTATION_STYLE } from 'constants/documentConstants';

import * as Styled from './TextStyleFormItem.styled';

// Define the props type for ColorPaletteLumin
interface ColorPaletteLuminProps {
  property: string;
  color: any;
  onStyleChange: (property: string, color: any) => void;
  colorMapKey: string;
  overridePalette?: any;
  annotation?: any;
  placement?: string;
  hideNoColor?: boolean;
  disabled?: boolean;
  isOpenRightToolPanel?: boolean;
  className?: string;
  isEnabledNewLayout?: boolean;
  isNewLayout?: boolean;
  anchorFreeTextTool?: any;
  onOpenFreeTextToolChromePicker?: () => void;
  onCompletedFreeTextToolChromePicker?: () => void;
  isToolbarPopoverOpened: boolean;
}

const ColorPalette = styled(ColorPaletteLumin)<ColorPaletteLuminProps>`
  &[data-new-layout='true'] {
    padding: 8px;
  }
`;

interface TextColorPickerProps {
  textColor: string;
  onTextColorChange: (property: string, color: string) => void;
}

const TextColorPicker = ({ textColor, onTextColorChange }: TextColorPickerProps) => {

  const renderColorPalette = () => (
    <div>
      <ColorPalette
        onStyleChange={onTextColorChange}
        color={textColor}
        colorMapKey={annotationColorMapKey.RUBBER_STAMP.TEXT}
        property={ANNOTATION_STYLE.TEXT_COLOR}
        isToolbarPopoverOpened={false}
      />
    </div>
  );

    return (
      <PopperState>
        {({ isOpen, openPopper, closePopper, anchorEl }) => (
          <>
            <IconButton
              onClick={openPopper}
              component={<Styled.ColorPickerIcon style={{ backgroundColor: textColor }} data-cy="text_color_picker"/>}
            />
            <Popper disablePortal placement="bottom-end" anchorEl={anchorEl} open={isOpen} onClose={closePopper}>
              {renderColorPalette()}
            </Popper>
          </>
        )}
      </PopperState>
    );
};

export default TextColorPicker;

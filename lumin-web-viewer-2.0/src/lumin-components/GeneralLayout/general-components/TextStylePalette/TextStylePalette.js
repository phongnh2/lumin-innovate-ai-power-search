import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import FontSizeSelect from '@new-ui/components/FontSizeSelect';
import ColorPalette from '@new-ui/general-components/ColorPalette';
import Divider from '@new-ui/general-components/Divider';
import Select from '@new-ui/general-components/Select';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import { CUSTOM_FONTS_V2 } from './constants';
import TextDecorationBtn from './TextDecorationBtn';

import * as Styled from './TextStylePalette.styled';

const TextStylePalette = React.forwardRef(
  ({ fonts: passedFonts, onChange, style, title, showTextDecoration, annotation }, ref) => {
    const fonts = useMemo(() => {
      const isExternalFont = passedFonts.every((font) => font.value !== style.Font);
      const fontList = isExternalFont ? [{ value: style.Font, label: style.Font }, ...passedFonts] : passedFonts;
      return fontList.map(({ value, ...rest }) => ({
        value,
        ...rest,
        itemProps: {
          sx: {
            '& .MenuItemHeadline': {
              fontFamily: value,
            },
          },
        },
      }));
    }, [passedFonts, style.Font]);

    const onColorPaletteChange = (_, value) => {
      onChange(ANNOTATION_STYLE.TEXT_COLOR, value);
    };

    const onFontChange = (_, { value }) => {
      onChange(ANNOTATION_STYLE.FONT, value);
    };

    const onFontSizeChange = (value) => {
      onChange(ANNOTATION_STYLE.FONT_SIZE, value);
    };

    const onTextDecorationsChange = (value) => {
      onChange(ANNOTATION_STYLE.FONT_STYLE, value);
    };

    const renderContent = () => {
      if (showTextDecoration) {
        return (
          <>
            <Select
              value={style.Font}
              options={fonts}
              onChange={onFontChange}
              inputProps={{ style: { fontFamily: style.Font } }}
              data-cy="font_select"
            />

            <Styled.SecondRowWrapper data-cy="font_style_wrapper">
              <FontSizeSelect value={style.FontSize} onChange={onFontSizeChange} />

              <Divider orientation="vertical" flexItem />

              <TextDecorationBtn onChange={onTextDecorationsChange} annotation={annotation} />
            </Styled.SecondRowWrapper>
          </>
        );
      }
      return (
        <Styled.Row>
          <Styled.LeftCol>
            <Select
              value={style.Font}
              options={fonts}
              onChange={onFontChange}
              inputProps={{ style: { fontFamily: style.Font } }}
              slotProps={{
                popper: {
                  disablePortal: true,
                  modifiers: [
                    {
                      name: 'preventOverflow',
                      options: {
                        boundary: 'viewport',
                      },
                    },
                  ],
                },
              }}
            />
          </Styled.LeftCol>

          <Styled.RightCol>
            <FontSizeSelect value={style.FontSize} onChange={onFontSizeChange} />
          </Styled.RightCol>
        </Styled.Row>
      );
    };

    return (
      <Styled.Wrapper ref={ref}>
        {title && <Styled.Title>{title}</Styled.Title>}

        {renderContent()}

        <ColorPalette className="color-palette" onChange={onColorPaletteChange} value={style.TextColor} />
      </Styled.Wrapper>
    );
  }
);

TextStylePalette.propTypes = {
  fonts: PropTypes.array,
  title: PropTypes.string,
  onChange: PropTypes.func,
  style: PropTypes.object,
  showTextDecoration: PropTypes.bool,
  annotation: PropTypes.object,
};
TextStylePalette.defaultProps = {
  fonts: CUSTOM_FONTS_V2,
  title: '',
  onChange: (f) => f,
  style: {},
  annotation: {},
  showTextDecoration: false,
};

export default TextStylePalette;

import React from 'react';

import ColorPalette from 'luminComponents/GeneralLayout/general-components/ColorPalette';
import Divider from 'luminComponents/GeneralLayout/general-components/Divider';
import OpacitySlider from 'luminComponents/GeneralLayout/general-components/OpacitySlider';
import withBaseStylePaletteWrap from 'luminComponents/GeneralLayout/HOCs/withBaseStylePaletteWrap';

import { useTranslation } from 'hooks';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import { ITextToolPaletteProps } from './TextToolStylePalette.interface';
import ChildButton from '../LuminToolbar/tools-components/BaseMultipleChildTool/ChildBtn';

import * as Styled from './TextToolStylePalette.styled';

const TextToolStylePalette = ({ onChange, style, tools, onToolClick, toolObjects }: ITextToolPaletteProps): JSX.Element => {
  const { t } = useTranslation();
  const onColorPaletteChange = (_: string, value: object): void => {
    onChange(ANNOTATION_STYLE.STROKE_COLOR, value);
  };

  const renderBtns = (passedTools: string[]): JSX.Element => {
    if (!passedTools?.length) {
      return null;
    }
    return (
      <>
        <Styled.Wrapper>
          <Styled.Title>{t('generalLayout.toolbar.chooseStyle')}</Styled.Title>

          <Styled.BtnsWrapper>
            {passedTools.map((tool) => (
              <ChildButton
                onClick={onToolClick}
                key={tool}
                toolName={tool}
                transToolName={t(toolObjects[tool].title)}
                shortcutKey={toolObjects[tool].dataElement}
              />
            ))}
          </Styled.BtnsWrapper>
        </Styled.Wrapper>

        <Divider style={{ margin: 0 }} />
      </>
    );
  };

  return (
    <>
      {renderBtns(tools)}

      <ColorPalette
        className="color-palette"
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        value={style.StrokeColor}
        onChange={onColorPaletteChange}
      />

      <OpacitySlider style={style} onChange={onChange} />
    </>
  );
};

export default withBaseStylePaletteWrap(TextToolStylePalette, 274);

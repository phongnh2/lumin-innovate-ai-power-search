import React from 'react';
import { useSelector } from 'react-redux';

import { ToolName } from 'core/type';

import selectors from 'selectors';

import FrameStylePalette from 'luminComponents/GeneralLayout/general-components/FrameStylePalette';
import OpacitySlider from 'luminComponents/GeneralLayout/general-components/OpacitySlider';
import withBaseStylePaletteWrap from 'luminComponents/GeneralLayout/HOCs/withBaseStylePaletteWrap';

import { useTranslation } from 'hooks';

import { getDataWithKey, mapToolNameToKey } from 'constants/map';

import { IShapeToolsStylePaletteProps, IDataWithKey } from './ShapeToolsStylePalette.interface';
import ChildButton from '../LuminToolbar/tools-components/BaseMultipleChildTool/ChildBtn';

import * as Styled from './ShapeToolsStylePalette.styled';

const ShapeToolsStylePalette = ({
  onChange,
  style,
  tools,
  onToolClick,
  forTool,
  toolObjects,
}: IShapeToolsStylePaletteProps): JSX.Element => {
  const { t } = useTranslation();
  const activeToolName: ToolName = useSelector(selectors.getActiveToolName);
  const toolName: string = mapToolNameToKey(forTool || activeToolName);
  const dataWithKey = getDataWithKey(toolName) as IDataWithKey;

  const renderHeaderSection = (passedTools: string[]): JSX.Element | null => {
    if (!passedTools || !passedTools.length) {
      return null;
    }
    return (
      <Styled.HeaderWrapper>
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
      </Styled.HeaderWrapper>
    );
  };

  return (
    <Styled.Wrapper data-cy="shape_tools_style_palette_wrapper">
      {renderHeaderSection(tools)}

      <FrameStylePalette
        availableTabs={dataWithKey.availablePalettes}
        title={t('generalLayout.toolProperties.textFrame')}
        style={style}
        onChange={onChange}
      />

      <OpacitySlider style={style} onChange={onChange} withTitle />
    </Styled.Wrapper>
  );
};

export default withBaseStylePaletteWrap(ShapeToolsStylePalette, 313);

import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import Tabs, { TabsList, Tab } from 'lumin-components/GeneralLayout/general-components/Tabs';

import { useTranslation } from 'hooks';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import FillStyle from './FillStyle';
import StrokeStyle from './StrokeStyle';

import * as Styled from './FrameStylePalette.styled';

const FRAME_STYLE_PALETTE_MAPPING = {
  FILL: ANNOTATION_STYLE.FILL_COLOR,
  STROKE: ANNOTATION_STYLE.STROKE_COLOR,
};

const getInitValue = (availableOnes) =>
  Object.values(FRAME_STYLE_PALETTE_MAPPING).find((value) => availableOnes.includes(value));

export const FrameStylePalette = ({ title, onChange, style, availableTabs }) => {
  const [value, setValue] = useState(() => getInitValue(availableTabs));
  const { t } = useTranslation();

  useEffect(() => {
    setValue(getInitValue(availableTabs));
  }, [availableTabs]);

  const renderContent = ({ value, onChange, style }) => {
    if (value === FRAME_STYLE_PALETTE_MAPPING.FILL) {
      return <FillStyle onChange={onChange} style={style} />;
    }

    return <StrokeStyle onChange={onChange} style={style} />;
  };

  return (
    <Styled.Wrapper>
      {title && <Styled.Title>{title}</Styled.Title>}
      <Styled.TabsWrapper data-cy="frame_style_palette_wrapper">
        <Tabs value={value} onChange={(_, value) => setValue(value)}>
          <TabsList>
            {Object.values(FRAME_STYLE_PALETTE_MAPPING).map((value) => (
              <Tab key={value} disabled={!availableTabs.includes(value)} value={value} data-cy="tab_label">
                {t(`generalLayout.toolbar.${value}`)}
              </Tab>
            ))}
          </TabsList>
        </Tabs>
      </Styled.TabsWrapper>

      <Styled.Content>{renderContent({ value, onChange, style })}</Styled.Content>
    </Styled.Wrapper>
  );
};

FrameStylePalette.propTypes = {
  title: PropTypes.string,
  onChange: PropTypes.func,
  style: PropTypes.object,
  availableTabs: PropTypes.array,
};

FrameStylePalette.defaultProps = {
  title: '',
  onChange: (f) => f,
  style: {},
  availableTabs: [ANNOTATION_STYLE.STROKE_COLOR, ANNOTATION_STYLE.FILL_COLOR],
};

export default FrameStylePalette;

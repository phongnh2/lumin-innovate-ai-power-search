import { connect } from 'react-redux';
import selectors from 'selectors';
import StylePalette from './StylePalette';

const DataElements = {
  COLOR_PALETTE: 'colorPalette',
  OPACITY_SLIDER: 'opacitySlider',
  STROKE_THICKNESS_SLIDER: 'strokeThicknessSlider',
  FONT_SIZE_SLIDER: 'fontSizeSlider',
  STYLE_OPTION: 'styleOption',
};

const mapStateToProps = (state, { colorMapKey }) => ({
  currentPalette: selectors.getCurrentPalette(state, colorMapKey),
  isStylePopupDisabled: selectors.isElementDisabled(state, DataElements.STYLE_POPUP),
  isColorPaletteDisabled: selectors.isElementDisabled(state, DataElements.COLOR_PALETTE),
  isOpacitySliderDisabled: selectors.isElementDisabled(state, DataElements.OPACITY_SLIDER),
  isStrokeThicknessSliderDisabled: selectors.isElementDisabled(state, DataElements.STROKE_THICKNESS_SLIDER),
  isFontSizeSliderDisabled: selectors.isElementDisabled(state, DataElements.FONT_SIZE_SLIDER),
  isStyleOptionDisabled: selectors.isElementDisabled(state, DataElements.STYLE_OPTION),
});

export default connect(mapStateToProps)(StylePalette);

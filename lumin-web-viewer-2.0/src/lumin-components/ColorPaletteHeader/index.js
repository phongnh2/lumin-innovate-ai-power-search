import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import actions from 'actions';
import selectors from 'selectors';
import ColorPaletteHeader from './ColorPaletteHeader';

const mapDispatchToProps = {
  setActivePalette: actions.setActivePalette,
};

const mapStateToProps = (state) => ({
  isTextColorPaletteDisabled: selectors.isElementDisabled(state, 'textColorPalette'),
  isFillColorPaletteDisabled: selectors.isElementDisabled(state, 'fillColorPalette'),
  isBorderColorPaletteDisabled: selectors.isElementDisabled(state, 'borderColorPalette'),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(null, { wait: false })(ColorPaletteHeader));

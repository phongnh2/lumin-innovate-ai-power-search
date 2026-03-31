import { connect } from 'react-redux';

import selectors from 'selectors';

import { DataElements } from 'constants/dataElement';

import ColorPaletteLumin from './ColorPaletteLumin';

const mapStateToProps = (state) => ({
  overridePalette: selectors.getCustomElementOverrides(state, 'colorPalette'),
  themeMode: selectors.getThemeMode(state),
  isToolbarPopoverOpened: selectors.isElementOpen(state, DataElements.TOOLBAR_POPOVER),
});

export default connect(mapStateToProps)(ColorPaletteLumin);

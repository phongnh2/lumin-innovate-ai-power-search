import React from 'react';
import { shallow } from 'enzyme';
import { MuiThemeProvider, createTheme } from '@mui/material/styles';
import { MaterialThemes } from '../../../constants/lumin-common';
import MaterialSwitch from '../MaterialSwitch';

describe('<MaterialSwitch />', () => {
  const props = {
    isChecked: false,
    defaultChecked: false,
    disabled: false,
    handleChange: () => {},
    noOffColor: false,
  };
  const theme = createTheme(MaterialThemes);

  it('MaterialSwitch render', () => {
    const wrapper = shallow(
      <MuiThemeProvider theme={theme}>
        <MaterialSwitch {...props} />
      </MuiThemeProvider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
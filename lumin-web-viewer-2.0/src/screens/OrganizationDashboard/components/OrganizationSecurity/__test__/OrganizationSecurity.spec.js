import React from 'react';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom'

import { renderWithRedux } from 'utils/test-utils';
import { MaterialThemes } from 'constants/lumin-common';
import OrganizationSecurity from '../index';
import { Plans } from 'constants/plan';

describe('<OrganizationSecurity />', () => {
  const setup = (props) => {
    const theme = createTheme(MaterialThemes);
    const history = createMemoryHistory();
    return renderWithRedux(
      <Router history={history}>
        <MuiThemeProvider theme={theme}>
          <OrganizationSecurity {...props} />
        </MuiThemeProvider>,
      </Router>,
      {
        initialState: {
          organization: {
            currentOrganization: { data: { name: 'mock', owner: 'dgroup.co', url: 'mock domain', payment: {type: Plans.BUSINESS}, settings: { googleSignin: true }, associateDomains: [] } },
          },
          auth: {
            currentUser: { email: "test@gmail.com" },
          }
        },
      }
    );
  };

  it('case 1: render page', () => {
    const { instance } = setup();
    expect(instance).toMatchSnapshot();
  });
});
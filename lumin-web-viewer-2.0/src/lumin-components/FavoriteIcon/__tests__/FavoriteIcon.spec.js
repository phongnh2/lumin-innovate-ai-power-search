import React from 'react';
import { MuiThemeProvider, createTheme } from '@mui/material/styles';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { renderWithRedux } from 'utils/test-utils';
import LuminButton from 'luminComponents/LuminButton';
import * as Redux from 'react-redux';
import { MaterialThemes } from '../../../constants/lumin-common';
import FavoriteIcon from '../FavoriteIcon';

const spyOnUseSelector = jest.spyOn(Redux, 'useSelector');

spyOnUseSelector.mockReturnValue([]);

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useMatch: () => ({ url: '/viewer/614f4c4759a4816804cfd542' }),
}));

jest.mock('services/graphServices/documentGraphServices', () => ({
  starDocumentMutation: jest.fn(),
}));

const stopPropagation = jest.fn();

const setup = (props) => {
  const theme = createTheme(MaterialThemes);
  const history = createMemoryHistory();
  return renderWithRedux(
    <Router history={history}>
      <MuiThemeProvider theme={theme}>
        <FavoriteIcon {...props} />
      </MuiThemeProvider>
    </Router>,
    { initialState: {} },
  );
}

describe('<FavoriteIcon />', () => {
  const props = {
    document: {
      listUserStar: ['123'],
    },
    currentUser: {
      _id: '123',
    },
    callback: jest.fn(),
    currentTeam: { _id: '123123' },
  };

  it('render', () => {
    const { instance } = setup();
    expect(instance).toMatchSnapshot();
  });

  it('render with listUserStar empty', () => {
    const newProps = {
      ...props,
      document: {
        listUserStar: [],
      },
    };
    const { instance } = setup();
    expect(instance).toMatchSnapshot();
  });

  it('LuminButton on click', () => {
    const { instance } = setup();
    instance.find(LuminButton).simulate('click', stopPropagation);
    expect(instance).toMatchSnapshot();
  });

  it('LuminButton on click with empty currentUser', () => {
    const newProps = {
      ...props,
      currentUser: {},
    };
    const { instance } = setup();
    instance.find(LuminButton).simulate('click', stopPropagation);
    expect(instance).toMatchSnapshot();
  });
});
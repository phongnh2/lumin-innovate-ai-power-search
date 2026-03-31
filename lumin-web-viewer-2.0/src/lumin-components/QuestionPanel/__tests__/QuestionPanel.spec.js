import React from 'react';
import { MuiThemeProvider, createTheme } from '@mui/material/styles';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { renderWithRedux } from 'utils/test-utils';
import { MaterialThemes } from '../../../constants/lumin-common';
import QuestionPanel from '../QuestionPanel';
import ButtonCollapse from 'luminComponents/ButtonCollapse';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useMatch: () => ({ url: '/viewer/614f4c4759a4816804cfd542' }),
}));

describe('<QuestionPanel />', () => {
  const setup = (props) => {
    const theme = createTheme(MaterialThemes);
    const history = createMemoryHistory();
    return renderWithRedux(
      <Router history={history}>
        <MuiThemeProvider theme={theme}>
          <QuestionPanel {...props} />
        </MuiThemeProvider>
      </Router>,
      { initialState: {} },
    );
  }

  it('case 1: default props', () => {
    const props = {
      section: {
        options: [],
      }
    };
    const { instance } = setup(props);
    expect(instance).toMatchSnapshot();
  });

  it('case 2: render button collapse', () => {
    const props = {
      section: {
        title: 'Single - sign on',
        options: [
          {
            title: 'Google - sign in1',
            subtitle: 'Require members sign in with a Google account',
            question: {
              text: '',
              type: 'COLLAPSE',
              field: {
                key: 'key',
                value: true,
              },
              onClick: () => {},
              dependents: [],
            },
          },
        ],
        permission: {
          isAllow: true,
        }
      }
    };
    const { instance } = setup(props);
    instance.find(ButtonCollapse).simulate('click');
    expect(instance).toMatchSnapshot();
  });

  it('case 3: render button link', () => {
    const props = {
      section: {
        title: 'Single - sign on',
        options: [
          {
            title: 'Google - sign in1',
            subtitle: 'Require members sign in with a Google account',
            question: {
              text: '',
              type: 'BUTTON',
              field: {
                key: 'key',
                value: true,
              },
              onClick: () => {},
              dependents: [],
            },
          },
        ],
        permission: {
          isAllow: false,
          disallowedReason: 'not allow',
        }
      }
    };
    const { instance } = setup(props);
    expect(instance).toMatchSnapshot();
  });
});
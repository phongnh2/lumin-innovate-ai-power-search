/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';
import * as ReactRedux from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Tooltip from '../Tooltip';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useMatch: () => ({ url: '/viewer/614f4c4759a4816804cfd542' }),
}));

function setup(props) {
  const defaultProps = {};
  const mergedProps = { defaultProps, ...props };
  const history = createMemoryHistory();
  const wrapper = shallow(
    <Router history={history}>
      <Tooltip {...mergedProps}>
        <button>OK</button>
      </Tooltip>
    </Router>
  );
  return { wrapper };
}

describe('<Tooltip />', () => {
  describe('render snapshot', () => {
    it('should match snapshot', () => {
      const spy = jest
      .spyOn(ReactRedux, 'useSelector')
      .mockImplementation(() => '');
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });
  });
});
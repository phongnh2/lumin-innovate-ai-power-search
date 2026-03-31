import React from 'react';
import { shallow } from 'enzyme';
import CustomCheckbox from '../CustomCheckbox';

describe('<CustomCheckbox/>', () => {
  const props = {
    themeMode: 'light',
    dispatch: jest.fn(),
  };
  it('snapshot render', () => {
    window.history.pushState( // add pathname simulate
      {},
      '',
      '/viewer/1231232',
    );
    const wrapper = shallow(<CustomCheckbox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render with dark mode', () => {
    const newProps = {
      ...props,
      themeMode: 'dark',
    };
    window.history.pushState( // add pathname simulate
      {},
      '',
      '/viewer/1231232',
    );
    const wrapper = shallow(<CustomCheckbox {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render none viewer', () => {
    const newProps = {
      ...props,
      themeMode: 'dark',
    };
    window.history.pushState( // add pathname simulate
      {},
      '',
      '/',
    );
    const wrapper = shallow(<CustomCheckbox {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});

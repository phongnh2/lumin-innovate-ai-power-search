import React from 'react';
import { shallow } from 'enzyme';
import StatefulButton from '../StatefulButton';

describe('<StatefulButton />', () => {
  const props = {
    initialState: 'newSignature',

    mount: jest.fn(),
    states: {
      defaultSignature: {},
      newSignature: {},
    },
    match: {
      params: {
        documentId: 'tour',
      },
    },
    currentUser: null,
  };
  it('snapshot render', () => {
    const wrapper = shallow(<StatefulButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('snapshot render documentId !== tour', () => {
    const newProps = {
      ...props,
      match: {
        params: {
          documentId: '123',
        },
      },
    };
    const wrapper = shallow(<StatefulButton {...newProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});

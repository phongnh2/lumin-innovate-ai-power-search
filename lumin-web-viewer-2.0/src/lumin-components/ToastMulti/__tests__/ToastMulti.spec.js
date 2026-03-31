import React from 'react';
import { shallow } from 'enzyme';
import { ModalTypes } from 'constants/lumin-common';
import ToastMulti from '../ToastMulti';

describe('<ToastMulti />', () => {
  it('snapshot render', () => {
    const props = {
      message: 'Lorem, ipsum dolor.',
      type: ModalTypes.SUCCESS
    };
    const wrapper = shallow(<ToastMulti {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
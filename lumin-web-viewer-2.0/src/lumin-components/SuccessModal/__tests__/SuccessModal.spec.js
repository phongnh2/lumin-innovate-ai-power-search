import React from 'react';
import { shallow } from 'enzyme';
import SuccessModal from '../SuccessModal';

describe('<SuccessModal />', () => {
  it('snapshot render', () => {
    const wrapper = shallow(<SuccessModal />);
    expect(wrapper).toMatchSnapshot();
  });
});

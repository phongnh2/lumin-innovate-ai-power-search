import React from 'react';
import { shallow } from 'enzyme';
import AnnouncementModal from '../AnnouncementModal';

const props ={
  open:true,
  onClose: jest.fn()
};

describe('<AnnouncementModal />', () => {
  it('snapshot render', () => {
    const wrapper = shallow(<AnnouncementModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

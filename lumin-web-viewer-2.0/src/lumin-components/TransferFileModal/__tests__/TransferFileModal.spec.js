import React from 'react';
import { shallow } from 'enzyme';
import TransferFileModal from '../TransferFileModal';

describe('<TransferFileModal />', () => {
  it('snapshot render', () => {
    const props = {
      currentDocument: {
        service: 's3',
        name: 'test.pdf'
      }
    }
    const wrapper = shallow(<TransferFileModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

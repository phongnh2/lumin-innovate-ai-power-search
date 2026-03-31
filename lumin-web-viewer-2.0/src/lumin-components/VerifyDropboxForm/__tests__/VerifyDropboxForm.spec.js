import React from 'react';
import { shallow } from 'enzyme';
import VerifyDropboxForm from '../VerifyDropboxForm';

describe('<VerifyDropboxForm />', () => {
  it('snapshot render', () => {
    const props = {
      location: {
        search: 'test'
      }
    };
    const wrapper = shallow(<VerifyDropboxForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
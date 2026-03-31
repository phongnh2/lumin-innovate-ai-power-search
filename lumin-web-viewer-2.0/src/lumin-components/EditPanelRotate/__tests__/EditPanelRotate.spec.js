import React from 'react';
import { shallow } from 'enzyme';
import EditPanelRotate from '../EditPanelRotate';

describe('<EditPanelRotate />', () => {
  const props = {
    currentDocument: {}
  };
  it('snapshot render', () => {
    const wrapper = shallow(
      <EditPanelRotate {...props} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
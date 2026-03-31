import React from 'react';
import { renderWithRedux } from 'utils/test-utils';
import ButtonCollapse from '../ButtonCollapse';

describe('<ButtonCollapse />', () => {
  const setup = (props) => {
    return renderWithRedux(
      <div>
        <ButtonCollapse {...props} />
      </div>,
      { initialState: {} },
    );
  }

  it('case 1: default props', () => {
    const { wrapper } = setup({});
    expect(wrapper).toMatchSnapshot();
  });

  it('case 2: open is true', () => {
    const props = { open: true };
    const { instance } = setup(props);
    instance.find('.ButtonCollapse__wrapper').first().simulate('click');
    expect(instance).toMatchSnapshot();
  });
});
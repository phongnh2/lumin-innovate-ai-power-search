import React from 'react';
import { shallow, mount } from 'enzyme';
import NoteContext from 'luminComponents/NoteLumin/Context';

import AutoResizeTextarea from '../AutoResizeTextarea';

let wrapper;
const mockContext = {};
const mockOnChange = jest.fn();
const mockOnSubmit = jest.fn();
const props = {
  onChange: mockOnChange,
  onSubmit: mockOnSubmit,
};
beforeEach(() => {
  const ref = React.createRef();
  wrapper = mount(
    <NoteContext.Provider value={mockContext}>
      <AutoResizeTextarea ref={(el) => { ref.current = el; }} {...props} />
    </NoteContext.Provider>,
  );
});
describe('<AutoResizeTextarea />', () => {
  it('test snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('simulate change textarea', () => {
    const textarea = wrapper;
    textarea.simulate('change', { target: { value: 'test' } });
    expect(mockOnChange).toBeCalled();
  });
});

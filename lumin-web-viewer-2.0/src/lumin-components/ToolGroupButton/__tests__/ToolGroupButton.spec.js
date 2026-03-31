import React from 'react';
import { shallow } from 'enzyme';
import ToolGroupButton from '../ToolGroupButton';

global._ = {
  get: jest.fn()
};

jest.mock('helpers/getColorFromStyle');
jest.mock('helpers/getCurrentRole');

jest.mock('core', () => ({
  getTool: jest.fn().mockReturnValue({ default: {} })
}));

describe('<ToolGroupButton />', () => {
  it('snapshot render', () => {
    const props = {
      activeToolName: 'AnnotationEdit',
      toolGroup: '',
      mediaQueryClassName: '',
      dataElement: '',
      toolNames: ['AnnotationCreateTextHighlight'],
      openElement: jest.fn(),
      toggleElement: jest.fn(),
      closeElement: jest.fn(),
      setActiveToolGroup: jest.fn(),
      t: jest.fn(),
      isActive: true,
      toolButtonObjects: {
        AnnotationCreateTextHighlight: {
          dataElement: 'highlightToolButton',
          title: 'annotation.highlight',
          icon: 'highlight',
          group: 'textTools',
          showColor: 'always'
        }
      }
    };
    const wrapper = shallow(<ToolGroupButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});

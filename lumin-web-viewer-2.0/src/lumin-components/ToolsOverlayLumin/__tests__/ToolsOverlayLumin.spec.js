import React from 'react';
import { shallow } from 'enzyme';
import ToolsOverlayLumin from '../ToolsOverlayLumin';

describe('<ToolsOverlayLumin />', () => {
  it('snapshot render', () => {
    const props = {
      closeElements: jest.fn(),
      setActiveToolGroup: jest.fn(),
      activeHeaderItems: [
        {
          type: 'toolGroupButton',
          toolGroup: 'textTools',
          dataElement: 'textToolGroupButton',
          title: 'component.textToolsButton',
          hidden: ['mobile'],
          additionalClass: 'ToolGroupButton--has-margin'
        }
      ],
      isOpen: true,
      activeToolGroup: 'textTools',
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
    const spyQuerySelector = jest
      .spyOn(document, 'querySelector')
      .mockReturnValue(<div></div>);
    const wrapper = shallow(<ToolsOverlayLumin {...props} />);
    expect(wrapper).toMatchSnapshot();
    spyQuerySelector.mockRestore();
  });
});
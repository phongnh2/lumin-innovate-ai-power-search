import React from 'react';
import { mount } from 'enzyme';

jest.mock('react-image', () => ({
  Img: ({ className, src, alt, unloader }) => (
    <div data-testid="img" className={className} data-src={src} data-alt={alt} data-has-unloader={!!unloader}>
      {unloader}
    </div>
  ),
}));

jest.mock('assets/reskin/lumin-svgs/pdf-xl.svg', () => 'pdf-xl.svg');

import DocumentThumbnail from '../DocumentThumbnail';

describe('DocumentThumbnail', () => {
  const defaultProps = {
    src: 'https://example.com/thumbnail.jpg',
    altText: 'Test Document',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render Img with src', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.prop('data-src')).toBe('https://example.com/thumbnail.jpg');
    wrapper.unmount();
  });

  it('should render Img with altText', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.prop('data-alt')).toBe('Test Document');
    wrapper.unmount();
  });

  it('should render Img with different src', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} src="https://example.com/other.jpg" />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.prop('data-src')).toBe('https://example.com/other.jpg');
    wrapper.unmount();
  });

  it('should render Img with different altText', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} altText="Another Document" />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.prop('data-alt')).toBe('Another Document');
    wrapper.unmount();
  });

  it('should provide unloader for default thumbnail', () => {
    const wrapper = mount(<DocumentThumbnail {...defaultProps} />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.prop('data-has-unloader')).toBe(true);
    wrapper.unmount();
  });

  it('should render with empty src', () => {
    const wrapper = mount(<DocumentThumbnail src="" altText="Empty" />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.prop('data-src')).toBe('');
    wrapper.unmount();
  });

  it('should render with empty altText', () => {
    const wrapper = mount(<DocumentThumbnail src="test.jpg" altText="" />);
    const img = wrapper.find('[data-testid="img"]');
    expect(img.prop('data-alt')).toBe('');
    wrapper.unmount();
  });
});


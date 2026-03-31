import React from 'react';
import { shallow } from 'enzyme';
import Pagination from '../Pagination';

describe('Pagination', () => {
  const props = {
    currentPage: 0,
    totalPages: 0,
    onPageSelected: jest.fn(),
  };
  it('snapshot renders', () => {
    const wrapper = shallow(
      <Pagination {...props} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Pagination currentPage 1', () => {
    const newProps = {
      ...props,
      currentPage: 1,
      totalPages: 2,
    };
    const wrapper = shallow(
      <Pagination {...newProps} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Pagination currentPage = totalPages', () => {
    const newProps = {
      ...props,
      currentPage: 2,
      totalPages: 2,
    };
    const wrapper = shallow(
      <Pagination {...newProps} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Pagination currentPage ', () => {
    const newProps = {
      ...props,
      currentPage: 2,
      totalPages: 3,
    };
    const wrapper = shallow(
      <Pagination {...newProps} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Pagination totalPages - last > 2', () => {
    const newProps = {
      ...props,
      currentPage: 2,
      totalPages: 7,
    };
    const wrapper = shallow(
      <Pagination {...newProps} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Pagination currentRegion[0] - 1 === 2', () => {
    const newProps = {
      ...props,
      currentPage: 4,
      totalPages: 5,
    };
    const wrapper = shallow(
      <Pagination {...newProps} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Pagination currentRegion[0] - 1 > 2', () => {
    const newProps = {
      ...props,
      currentPage: 5,
      totalPages: 6,
    };
    const wrapper = shallow(
      <Pagination {...newProps} />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});

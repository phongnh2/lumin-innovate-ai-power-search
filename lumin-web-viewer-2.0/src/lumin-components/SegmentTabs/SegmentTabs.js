import React from 'react';
import PropTypes from 'prop-types';

import * as Styled from './SegmentTabs.styled';

const propTypes = {
  selected: PropTypes.string.isRequired,
  tabs: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  tracking: PropTypes.bool,
};
const defaultProps = {
  tracking: true,
};

const SegmentTabs = ({
  selected, tabs, onChange, tracking,
}) => {
  const activeIndex = tabs.findIndex((tab) => tab.id === selected);
  return (
    <Styled.Segment>
      {tabs.map((tab) => (
        <Styled.SegmentButton
          key={tab.id}
          {...(tracking && ({
            'data-lumin-btn-name': tab.name,
            'data-lumin-btn-purpose': tab.purpose,
          }))}
          active={selected === tab.id}
          onClick={() => onChange(tab.id)}
          disabled={tab.disabled}
        >
          {tab.label}
        </Styled.SegmentButton>
      ))}
      <Styled.ActiveTab $activeIndex={activeIndex} />
    </Styled.Segment>
  );
};

SegmentTabs.propTypes = propTypes;
SegmentTabs.defaultProps = defaultProps;

export default SegmentTabs;

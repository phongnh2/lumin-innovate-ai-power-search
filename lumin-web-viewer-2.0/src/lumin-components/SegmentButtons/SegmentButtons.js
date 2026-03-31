import React from 'react';
import PropTypes from 'prop-types';
import './SegmentButton.scss';
import classNames from 'classnames';

const propTypes = {
  selected: PropTypes.string.isRequired,
  tabs: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

const SegmentButtons = ({
  selected, tabs, onChange,
}) => (
  <>
    {tabs.map((tab) => (
      <button
        className={classNames('SegmentButtons__item', {
          'SegmentButtons__item--active': selected === tab.id,
          'SegmentButtons__item--disabled': tab.disabledTab,
        })}
        key={tab.id}
        onClick={() => onChange(tab.id)}
      >
        {tab.labelMb ?
          <>
            <p className="SegmentButtons__text SegmentButtons__text--pc">{tab.labelPc}</p>
            <p className="SegmentButtons__text SegmentButtons__text--mb">{tab.labelMb}</p>
          </> :
          <p className="SegmentButtons__text">{tab.labelPc}</p>}
      </button>
    ))}
  </>
);

SegmentButtons.propTypes = propTypes;

export default SegmentButtons;

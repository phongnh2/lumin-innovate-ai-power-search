import PropTypes from 'prop-types';
import React, {
  useEffect, useRef, useState, useCallback,
} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

import {
  StyledLoading,
} from './SearchInput.styled';

const MAX_HEIGHT_POPOVER = 400;

function SearchInputPopper(props) {
  const {
    resultComponent,
    onSelect,
    options,
    loading,
    setPopperShow,
    setText,
    isReskin,
  } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(selectedIndex);
  const optionsRef = useRef(options);

  function closePopper() {
    setPopperShow(false);
  }

  const onSelectWithClosePopper = (itemData) => {
    if (itemData.disabled) {
      return;
    }
    onSelect(itemData);
    closePopper();
    setText('');
  };

  const renderResult = useCallback(() => options.map((item, index) => (
    <div key={item._id}>
      {resultComponent({
        data: item,
        onClick: () => onSelectWithClosePopper(item),
        selected: selectedIndex === index,
        isReskin,
      })}
    </div>
  )), [options, selectedIndex]);

  useEffect(() => {
    optionsRef.current = options;
    setSelectedIndex(-1);
  }, [options]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    function handlePressEnter() {
      const submittedData = optionsRef.current[selectedIndexRef.current];
      if (submittedData) {
        onSelectWithClosePopper(submittedData);
      }
    }

    function handlePressArrowUp() {
      setSelectedIndex((prevIndex) => (prevIndex <= 0 ? optionsRef.current.length - 1 : prevIndex - 1));
    }

    function handlePressArrowDown() {
      setSelectedIndex((prevIndex) => (prevIndex >= optionsRef.current.length - 1 ? 0 : prevIndex + 1));
    }

    function handleKeyDown(e) {
      switch (e.key) {
        case 'ArrowUp':
          handlePressArrowUp();
          break;
        case 'ArrowDown':
          handlePressArrowDown();
          break;
        case 'Enter':
          handlePressEnter();
          break;

        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div>
      <Scrollbars
        style={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? 'none' : 'all',
        }}
        autoHide
        autoHeight
        autoHeightMax={MAX_HEIGHT_POPOVER}
        hideTracksWhenNotNeeded
      >
        {renderResult()}
      </Scrollbars>
      {loading && <StyledLoading size={24} />}
    </div>
  );
}

SearchInputPopper.propTypes = {
  onSelect: PropTypes.func,
  resultComponent: PropTypes.any.isRequired,
  options: PropTypes.array,
  loading: PropTypes.bool,
  setPopperShow: PropTypes.func.isRequired,
  setText: PropTypes.func.isRequired,
  isReskin: PropTypes.bool,
};

SearchInputPopper.defaultProps = {
  onSelect: () => {},
  options: [],
  loading: false,
  isReskin: false,
};

export default SearchInputPopper;

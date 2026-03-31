import Collapse from '@mui/material/Collapse';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

import Icomoon from 'luminComponents/Icomoon';

import { Colors } from 'constants/styles';

import * as Styled from './LuminCollapsedList.styled';

const propTypes = {
  title: PropTypes.string.isRequired,
  collapsible: PropTypes.bool,
  arrow: PropTypes.bool,
  list: PropTypes.array,
  renderItem: PropTypes.func.isRequired,
  onToggle: PropTypes.func,
  defaultState: PropTypes.bool,
  scrollOptions: PropTypes.exact({
    scrollable: PropTypes.bool,
    autoHide: PropTypes.bool,
    autoHeight: PropTypes.bool,
    autoHeightMax: PropTypes.number,
    autoHeightMin: PropTypes.number,
  }),
};
const defaultProps = {
  arrow: true,
  collapsible: true,
  defaultState: false,
  list: [],
  onToggle: () => {},
  scrollOptions: {
    scrollable: false,
    autoHide: false,
    autoHeight: false,
    autoHeightMax: 100,
    autoHeightMin: 0,
  },
};

const DEBOUNCE_TOGGLE = 200;

const LuminCollapsedList = React.forwardRef(({
  title,
  collapsible,
  arrow,
  list,
  renderItem,
  defaultState,
  onToggle,
  scrollOptions,
}, ref) => {
  const [isOpen, setOpen] = useState(defaultState);
  const debounceToggle = useCallback(debounce(() => {
    if (collapsible) {
      setOpen(!isOpen);
      onToggle();
    }
  }, DEBOUNCE_TOGGLE), [isOpen]);

  const renderList = () => (
    <Styled.List>
      {list.map(renderItem)}
    </Styled.List>
  );

  const renderListHOF = () => {
    if (!scrollOptions.scrollable) {
      return renderList();
    }

    const { ...options } = scrollOptions;

    return (
      <Scrollbars
        {...options}
      >
        {renderList()}
      </Scrollbars>
    );
  };

  return (
    <Styled.Container ref={ref}>
      <Styled.HeaderContainer
        collapsible={collapsible}
        onClick={debounceToggle}
        disabled={!collapsible}
      >
        <Styled.HeaderText>{title}</Styled.HeaderText>
        {arrow && (
          <Styled.HeaderArrow isOpen={isOpen}>
            <Icomoon className="arrow-down" size={10} color={Colors.SECONDARY} />
          </Styled.HeaderArrow>
        )}
      </Styled.HeaderContainer>
      <Collapse in={isOpen}>
        {renderListHOF()}
      </Collapse>
    </Styled.Container>
  );
});

LuminCollapsedList.propTypes = propTypes;
LuminCollapsedList.defaultProps = defaultProps;

export default LuminCollapsedList;

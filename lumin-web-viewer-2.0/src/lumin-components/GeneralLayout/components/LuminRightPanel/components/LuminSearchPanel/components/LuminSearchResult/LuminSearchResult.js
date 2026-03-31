import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import * as Styled from './LuminSearchResult.styled';

class LuminSearchResult extends React.PureComponent {
  onClick = () => {
    const { onClickResult, index, result } = this.props;

    onClickResult(index, result);
  };

  renderContent = () => {
    // eslint-disable-next-line camelcase
    const { ambient_str, result_str_start, result_str_end } = this.props.result;
    const textBeforeSearchValue = ambient_str.slice(0, result_str_start);
    const searchValue = ambient_str.slice(result_str_start, result_str_end);
    const textAfterSearchValue = ambient_str.slice(result_str_end);

    return (
      <>
        {textBeforeSearchValue}
        <Styled.SearchValue>{searchValue}</Styled.SearchValue>
        {textAfterSearchValue}
      </>
    );
  };

  render() {
    const { activeResultIndex, index } = this.props;
    const selected = index === activeResultIndex;

    return (
      <Styled.SearchResult $selected={selected} onClick={this.onClick}>
        {this.renderContent()}
      </Styled.SearchResult>
    );
  }
}

LuminSearchResult.propTypes = {
  index: PropTypes.number.isRequired,
  result: PropTypes.object.isRequired,
  activeResultIndex: PropTypes.number.isRequired,
  onClickResult: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  activeResultIndex: selectors.getActiveResultIndex(state),
});

export default connect(mapStateToProps)(LuminSearchResult);

import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import PropTypes from 'prop-types';
import React from 'react';

import './CollapsedList.scss';

const propTypes = {
  renderHeader: PropTypes.func,
  children: PropTypes.node,
  classNames: PropTypes.string,
  isOpen: PropTypes.bool,
  handleToggle: PropTypes.func,
  selfControl: PropTypes.bool,

};

const defaultProps = {
  renderHeader: () => {},
  children: null,
  classNames: '',
  isOpen: false,
  handleToggle: () => {},
  selfControl: false,

};

class CollapsedList extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      open: false,
    };
  }

  _handleToggle = () => {
    this.setState(({ open }) => ({
      open: !open,
    }));
  };

  stateOpen = () => {
    const { selfControl, isOpen } = this.props;
    if (selfControl) {
      return isOpen;
    }

    return this.state.open;
  };

  onToggle = () => {
    const { selfControl, handleToggle } = this.props;
    if (selfControl) {
      return handleToggle();
    }

    return this._handleToggle();
  };

  render() {
    const {
      renderHeader, children, classNames,
    } = this.props;

    return (
      <div className={`CollapsedList ${classNames}`}>
        <ListItem button onClick={this.onToggle} className="CollapsedList__header">
          <Grid container spacing={1} alignItems="center" justifyContent="space-between">
            <Grid item xs={11}>
              {renderHeader()}
            </Grid>
            <Grid item xs={1}>
              <ExpandMore className={`CollapsedList__icon ${this.stateOpen() ? 'active' : ''}`} />
            </Grid>
          </Grid>
        </ListItem>
        <Collapse in={this.stateOpen()} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
      </div>
    );
  }
}

CollapsedList.propTypes = propTypes;
CollapsedList.defaultProps = defaultProps;

export default CollapsedList;

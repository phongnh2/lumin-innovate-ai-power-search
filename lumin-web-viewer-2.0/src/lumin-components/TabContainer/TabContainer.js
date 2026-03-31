/* eslint-disable no-useless-constructor */
/* eslint-disable react/prop-types */
import { Typography } from '@mui/material';
import React from 'react';

class TabContainer extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Typography component="div" className={this.props.className || ''}>
          {this.props.children}
        </Typography>
    );
  }
}

export default TabContainer;

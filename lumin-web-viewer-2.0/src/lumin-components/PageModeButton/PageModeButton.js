import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import MaterialPopper from 'luminComponents/MaterialPopper';
import './PageModeButton.scss';

export default class PageModeButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    //   open: false,
      openPopper: false,
      pageMode: 0,
    };
    this.pageMode = [
      {
        icon: 'pages',
        label: 'All Pages',
      },
      {
        icon: 'edit',
        label: 'Annotations',
      },
      {
        icon: 'bookmark',
        label: 'Bookmarks',
      },
    ];
    this._handleChangePageMode = this._handleChangePageMode.bind(this);
    this._handleToggle = this._handleToggle.bind(this);
  }

  _handleChangePageMode(value) {
    this.setState({
      pageMode: value,
      openPopper: false,
    });
  }

  _handleToggle() {
    const { openPopper } = this.state;
    this.setState({
      openPopper: !openPopper,
    });
  }

  render() {
    const { openPopper } = this.state;
    return (
      <div className="PageModeButton">
        <Button
          aria-label="page-mode"
          ref={(node) => {
            this.anchorElPageMode = node;
          }}
          onClick={() => this._handleToggle('pageMode')}
          className={`PageModeButton__btn ${openPopper ? 'active' : ''}`}
        >
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            className="PageModeButton__btn_container"
          >
            <Grid item><Icomoon className={`${this.pageMode[this.state.pageMode].icon} icon__16`} /></Grid>
            <Grid item className="PageModeButton__btn_value">{this.pageMode[this.state.pageMode].label}</Grid>
            <Grid item><Icomoon className="dropdown" /></Grid>
          </Grid>
        </Button>
        <MaterialPopper
          open={openPopper}
          anchorEl={this.anchorElPageMode}
          handleClose={this._handleToggle}
        >
          <MenuList>
            <MenuItem onClick={() => this._handleChangePageMode(0)}>
              <Icomoon className="pages icon__16" /> All Pages
            </MenuItem>
            <MenuItem onClick={() => this._handleChangePageMode(1)}>
              <Icomoon className="edit icon__16" /> Annotations
            </MenuItem>
            <MenuItem onClick={() => this._handleChangePageMode(2)}>
              <Icomoon className="bookmark icon__16" /> Bookmarks
            </MenuItem>
          </MenuList>
        </MaterialPopper>
      </div>
    );
  }
}

/* eslint-disable import/no-cycle */
/* eslint-disable import/no-named-as-default */
import React from 'react';
import { connect } from 'react-redux';

import Menu from 'lumin-components/GeneralLayout/general-components/Menu';
import Paper from 'lumin-components/GeneralLayout/general-components/Paper';
import Divider from 'luminComponents/GeneralLayout/general-components/Divider';

import { useTranslation } from 'hooks';

import InsertBlankPageAbove from './components/InsertBlankPageAbove';
import InsertBlankPageBelow from './components/InsertBlankPageBelow';
import MovePageToBottom from './components/MovePageToBottom';
import MovePageToTop from './components/MovePageToTop';
import RemoveThumbnail from './components/RemoveThumbnail';
import RotateClockwise from './components/RotateClockwise';
import RotateCounterclockwise from './components/RotateCounterclockwise';

export const PopperContent = React.forwardRef((props, ref) => {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { t } = useTranslation();

  return (
    <Paper elevation={1}>
      <Menu ref={ref}>
        <MovePageToTop />
        <MovePageToBottom />

        <Divider />

        <RotateClockwise />

        <RotateCounterclockwise />

        <Divider />

        <InsertBlankPageAbove />
        <InsertBlankPageBelow />

        <Divider />
        <RemoveThumbnail />
      </Menu>
    </Paper>
  );
});

PopperContent.propTypes = {};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(PopperContent);

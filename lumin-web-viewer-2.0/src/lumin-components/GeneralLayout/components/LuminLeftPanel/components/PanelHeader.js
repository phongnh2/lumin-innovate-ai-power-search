import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Divider from '@new-ui/general-components/Divider';
import IconButton from '@new-ui/general-components/IconButton';

import actions from 'actions';

import styles from './BookmarkPanel/BookmarkPanel.module.scss';
import * as Styled from '../LuminLeftPanel.styled';

const PanelHeader = ({ title, setIsLeftPanelOpen }) => (
  <Styled.HeaderWrapper>
    <Styled.HeaderPanel>
      <h2 className={styles.headerTitle}>{title}</h2>
      <IconButton
        data-cy="close_thumbnail_panel"
        icon="md_close"
        size="medium"
        iconSize={24}
        onClick={() => setIsLeftPanelOpen(false)}
      />
    </Styled.HeaderPanel>

    <Divider />
  </Styled.HeaderWrapper>
);

PanelHeader.propTypes = {
  title: PropTypes.string.isRequired,
  setIsLeftPanelOpen: PropTypes.func.isRequired,
};
const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  setIsLeftPanelOpen: (args) => dispatch(actions.setIsLeftPanelOpen(args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PanelHeader);

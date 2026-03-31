/* eslint-disable arrow-body-style */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingContent from './LoadingContent';
import MainContent from './MainContent';

const RestoreOriginalModalContent = ({ loading }) => {
  if (loading) {
    return <LoadingContent />;
  }
  return <MainContent />;
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

RestoreOriginalModalContent.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(RestoreOriginalModalContent);

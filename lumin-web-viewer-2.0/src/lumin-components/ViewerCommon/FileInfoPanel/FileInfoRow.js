import { Grid } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const FileInfoRow = (props) => {
  const { title, content, classes } = props;
  return (
    <Grid container className={`FileInfoPanel__row ${classes}`}>
      <Grid item xs={5}>
        <div className="FileInfoPanel__title">
          {title}
        </div>
      </Grid>
      <Grid item xs={7}>
        <div className="FileInfoPanel__content">
          {content}
        </div>
      </Grid>
    </Grid>
  );
};

FileInfoRow.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  classes: PropTypes.string,
};

FileInfoRow.defaultProps = {
  title: '',
  content: '',
  classes: '',
};

export default FileInfoRow;

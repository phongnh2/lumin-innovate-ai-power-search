import { Grid } from '@mui/material';
import { isString } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import * as Styled from './FileMenu.styled';

const FileInfoRow = (props) => {
  const { title, content } = props;
  return (
    <Grid container>
      <Grid item alignItems="top" xs={5}>
        <Styled.SubTitle>{title}:</Styled.SubTitle>
      </Grid>
      <Grid item xs={7}>
        <Styled.Content as={isString(content) ? 'p' : 'div'}>{content}</Styled.Content>
      </Grid>
    </Grid>
  );
};

FileInfoRow.propTypes = {
  title: PropTypes.string,
  content: PropTypes.node,
};

FileInfoRow.defaultProps = {
  title: '',
  content: '',
};

export default FileInfoRow;

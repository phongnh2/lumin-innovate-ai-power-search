import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';

import withUploadTemplate from 'HOC/withUploadTemplate';
import { STORAGE_TYPE } from 'constants/lumin-common';

import * as Styled from './UploadTemplateDropzone.styled';

function UploadTemplateDropzone(props) {
  const {
    children, disabled, onUploadFiles,
  } = props;
  const { getRootProps, isDragActive } = useDropzone({
    disabled,
    noClick: true,
    noKeyboard: true,
    onDrop: (files, fileRejections) => onUploadFiles([...files, ...fileRejections], STORAGE_TYPE.LOCAL),
    multiple: false,
  });
  const rootProps = useMemo(getRootProps, [getRootProps]);
  return (
    <Styled.Container {...rootProps}>
      <Styled.Highlight $active={isDragActive}>{children}</Styled.Highlight>
    </Styled.Container>
  );
}

UploadTemplateDropzone.propTypes = {
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  onUploadFiles: PropTypes.func.isRequired,
};
UploadTemplateDropzone.defaultProps = {
  disabled: false,
};

export default withUploadTemplate(UploadTemplateDropzone);

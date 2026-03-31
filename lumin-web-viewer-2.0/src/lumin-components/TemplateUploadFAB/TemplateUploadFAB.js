import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import SvgElement from 'luminComponents/SvgElement';
import Icomoon from 'luminComponents/Icomoon';
import GoogleFilePicker from 'luminComponents/GoogleFilePicker';
import DropboxFileChooser from 'luminComponents/DropboxFileChooser';
import withUploadTemplate from 'HOC/withUploadTemplate';

import { useLockBodyScroll } from 'hooks';
import { general } from 'constants/documentType';
import { UPLOAD_FILE_TYPE } from 'constants/customConstant';
import { Colors } from 'constants/styles';
import * as Styled from './TemplateUploadFAB.styled';

function TemplateUploadFAB({
  onUploadFiles,
}) {
  const [open, setOpen] = useState(false);
  useLockBodyScroll(open);
  const inputRef = useRef(null);
  const onToggle = () => {
    setOpen((prev) => !prev);
  };
  const onClose = () => {
    setOpen(false);
  };
  const onLocalClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  return (
    <>
      <Styled.Overlay onClick={onClose} $active={open} />
      <Styled.Container>
        <Styled.Fab $active={open} $pos={3}>
          <GoogleFilePicker
            uploadFiles={onUploadFiles}
            uploadType={UPLOAD_FILE_TYPE.TEMPLATE}
            mimeType={general.PDF}
            onPicked={onClose}
            multiSelect={false}
          >
            <SvgElement content="google" width={32} height={32} />
          </GoogleFilePicker>
        </Styled.Fab>
        <Styled.Fab $active={open} $pos={2}>
          <DropboxFileChooser
            uploadFiles={onUploadFiles}
            uploadType={UPLOAD_FILE_TYPE.TEMPLATE}
            onPicked={onClose}
            multiSelect={false}
          >
            <SvgElement content="dropbox" width={32} height={32} />
          </DropboxFileChooser>
        </Styled.Fab>
        <Styled.Fab $active={open} $pos={1} onClick={onLocalClick}>
          <Icomoon className="local-files" size={32} color={Colors.NEUTRAL_100} />
        </Styled.Fab>
        <Styled.RootFab $active={open} onClick={onToggle}>
          <Icomoon className="plus-thin TemplateUploadFAB__plus" size={16} color={Colors.WHITE} />
        </Styled.RootFab>
      </Styled.Container>
      <input
        type="file"
        ref={inputRef}
        style={{ display: 'none' }}
        multiple={false}
        onClick={onClose}
        onChange={(e) => {
          const { files = {} } = e.target;
          const filesArray = Object.keys(files).map((key) => files[key]);
          if (filesArray.length) {
            onUploadFiles(filesArray);
            onClose();
          }
          e.target.value = null;
        }}
        accept={general.PDF}
      />
    </>
  );
}

TemplateUploadFAB.propTypes = {
  onUploadFiles: PropTypes.func.isRequired,
};

export default withUploadTemplate(TemplateUploadFAB);

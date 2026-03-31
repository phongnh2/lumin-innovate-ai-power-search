import PropTypes from 'prop-types';
import React, { useContext, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { compose } from 'redux';

import { DocumentContext } from 'luminComponents/Document/context';

import withDropDocPopup from 'HOC/withDropDocPopup';
import { DropDocumentPopupContext } from 'HOC/withDropDocPopup/withDropDocPopupProvider';

import { useEnableWebReskin, useGetFolderType } from 'hooks';

import { folderType } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

import DropZoneComponent from './DropZoneComponent';

import * as Styled from './UploadDropZone.styled';

const propTypes = {
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  highlight: PropTypes.bool,
  onFilesPicked: PropTypes.func.isRequired,
  onDropStateChanged: PropTypes.func,
  isOffline: PropTypes.bool,
};

const defaultProps = {
  disabled: false,
  highlight: false,
  onDropStateChanged: () => {},
  isOffline: false,
};

const UploadDropZone = (props) => {
  const {
    children, disabled, highlight, onDropStateChanged, onFilesPicked, isOffline,
  } = props;
  const { isEnableReskin } = useEnableWebReskin();
  const { name, folderDraggingOver } = useContext(DropDocumentPopupContext);
  const { isDragging } = useContext(DocumentContext);
  const currentFolderType = useGetFolderType();

  const onDrop = async (files, _, evt) => {
    if (isOffline || currentFolderType === folderType.DEVICE) {
      const fileHandlesPromise = [];
      const { items } = evt.dataTransfer;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          // eslint-disable-next-line no-await-in-loop
          fileHandlesPromise.push(items[i].getAsFileSystemHandle());
        }
        const fileHandles = await Promise.all(fileHandlesPromise);
        onFilesPicked(fileHandles, STORAGE_TYPE.SYSTEM);
      }
    } else {
      onFilesPicked(files, STORAGE_TYPE.LOCAL);
    }
  };

  const { getRootProps, isDragActive } = useDropzone({
    disabled: disabled || isDragging,
    noClick: true,
    noKeyboard: true,
    onDrop,
    noDragEventsBubbling: isEnableReskin,
  });

  const rootProps = useMemo(getRootProps, [getRootProps]);

  useEffect(() => {
    onDropStateChanged(isDragActive);
  }, [isDragActive]);

  const ReskinComponents = isEnableReskin
    ? {
        Container: Styled.ContainerReskin,
      }
    : {
        Container: Styled.Container,
      };

  return (
    <ReskinComponents.Container {...rootProps}>
      <DropZoneComponent
        highlight={highlight}
        isDragging={isDragActive || (isEnableReskin && Boolean(name || folderDraggingOver))}
      >
        {children}
      </DropZoneComponent>
    </ReskinComponents.Container>
  );
};

UploadDropZone.propTypes = propTypes;
UploadDropZone.defaultProps = defaultProps;

export default compose(
  withDropDocPopup.Consumer,
  React.memo,
)(UploadDropZone);

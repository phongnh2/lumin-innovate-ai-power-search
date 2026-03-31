/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable import/no-named-as-default */
import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import Popper from '@new-ui/general-components/Popper';

import GoogleFilePicker from 'lumin-components/GoogleFilePicker';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';

import UploadPopoverContent from './UploadPopoverContent';
import { MergePanelContext } from '../MergePanel';

export const UploadPopover = ({ renderChildren }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);
  const { googlePickerFileRef, inputFileRef, handleLocalFileChange, handleGoogleFileChange } =
    useContext(MergePanelContext);

  return (
    <>
      {renderChildren({ handleClick })}

      <input
        type="file"
        className="EditPanelMergePage__inputFile"
        ref={inputFileRef}
        onChange={(e) => {
          handleLocalFileChange(e);
          handleClose();
        }}
        accept={featureStoragePolicy.getSupportedMimeTypes(AppFeatures.MERGE_FILE).join(',')}
        multiple
        hidden
      />

      <div className="EditPanelMergePage__inputFile">
        <GoogleFilePicker
          onClose={handleClose}
          onPicked={handleGoogleFileChange}
          isUpload={false}
          multiSelect
          mimeType={featureStoragePolicy.getSupportedMimeTypes(AppFeatures.MERGE_FILE).join(',')}
        >
          <div className="google-picker" ref={googlePickerFileRef} />
        </GoogleFilePicker>
      </div>

      <Popper open={open} anchorEl={anchorEl} onClose={handleClose}>
        <UploadPopoverContent handleClose={handleClose} />
      </Popper>
    </>
  );
};

UploadPopover.propTypes = {
  renderChildren: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(UploadPopover);

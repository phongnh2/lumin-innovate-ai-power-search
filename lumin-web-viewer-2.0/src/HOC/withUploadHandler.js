import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import { uploadServices } from 'services';

import { UploadUtils } from 'utils';

import { store } from '../redux/store';

const withUploadHandler = (Component) => {
  class HOC extends React.PureComponent {
    constructor(props) {
      super(props);
      uploadServices.registerHandler(props.handlerName, props.handleUploadProgress);
    }

    componentDidUpdate(prevProps) {
      const { uploadingFiles } = this.props;
      const isFirstTimeUpload = Boolean(!prevProps.uploadingFiles.length && uploadingFiles.length);
      const isAfterUploadDone = Boolean(
        prevProps.uploadingFiles.length && UploadUtils.isFreeQueue(prevProps.uploadingFiles)
      );
      if (isFirstTimeUpload || isAfterUploadDone) {
        this.uploadFileSequence(this.getUploadingList());
      }
    }

    // eslint-disable-next-line class-methods-use-this
    getUploadingList = () => selectors.getUploadingDocuments(store.getState());

    uploadFileSequence = async (uploadList = []) => {
      const failedTasks = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const fileUpload of uploadList) {
        const handleUploadProgress = uploadServices.getUploadHandler(fileUpload.handlerName);
        // eslint-disable-next-line no-await-in-loop
        const failedTask = await handleUploadProgress(fileUpload);
        if (failedTask) {
          failedTasks.push(failedTask);
        }
      }
      const newUploadedList = this.getUploadingList();

      if (failedTasks.length) {
        const restartList = failedTasks.map((task) => {
          const restartTask = UploadUtils.getRestartTask(task, newUploadedList);
          if (restartTask) {
            return restartTask;
          }

          return false;
        }).filter(Boolean);

        if (restartList.length) {
          this.uploadFileSequence(restartList);
          return;
        }
      }
      if (
        newUploadedList.length &&
        (uploadList.length !== newUploadedList.length || !UploadUtils.isFreeQueue(newUploadedList))
      ) {
        this.uploadFileSequence(newUploadedList);
      }
    };

    render() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { handleUploadProgress, uploadingFiles, ...rest } = this.props;
      return <Component {...rest} />;
    }
  }

  HOC.propTypes = {
    uploadingFiles: PropTypes.array,
    handleUploadProgress: PropTypes.func,
    handlerName: PropTypes.string,
  };
  HOC.defaultProps = {
    uploadingFiles: [],
    handleUploadProgress: () => {},
    handlerName: 'none_handler',
  };

  const mapStateToProps = (state) => ({
    uploadingFiles: selectors.getUploadingDocuments(state),
  });

  return connect(mapStateToProps)(HOC);
};

export default withUploadHandler;

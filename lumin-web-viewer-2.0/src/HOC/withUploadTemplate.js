import React, { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import v4 from 'uuid/v4';

import actions from 'actions';

import TemplateContext from 'screens/Templates/context';

import TemplateModal from 'lumin-components/TemplateModal';

import { usePreUploadTemplate, useTranslation } from 'hooks';

import { uploadServices } from 'services';

import { file as fileUtil, toastUtils, UploadUtils } from 'utils';

import { STORAGE_TYPE } from 'constants/lumin-common';

const withUploadTemplate = (Component) => (props) => {
  const dispatch = useDispatch();
  const { uploadedTemplate, setUploadedTemplate } = useContext(TemplateContext);
  const {
    getFileData, preCheckingFileUpload, onCreate, clientId,
  } = usePreUploadTemplate();
  const { t } = useTranslation();

  const showUploadFailedToast = (message) => {
    toastUtils.error({
      message: message || t('templatePage.canGetFilesToUpload'),
    });
  };

  const handlePreUploadError = ({ error, file }) => {
    const groupId = v4();
    dispatch(actions.addUploadingFiles([{
      groupId,
      fileData: {
        file,
      },
      status: UploadUtils.UploadStatus.ERROR,
      entityId: clientId,
      handlerName: uploadServices.TEMPLATE_HANDLER,
      errorMessage: error.message,
    }]));
  };

  const onUploadFiles = async (files, uploadFrom = STORAGE_TYPE.LOCAL) => {
    if (files.length !== 1) {
      showUploadFailedToast(t('templatePage.pleaseUploadTemplateOneByOne'));
      return;
    }
    const uploadedFile = files[0];
    const error = await preCheckingFileUpload(uploadedFile);
    if (error) {
      handlePreUploadError({ error, file: uploadedFile });
      return;
    }

    const fileName = fileUtil.getFilenameWithoutExtension(uploadedFile.name);

    const {
      file: newFile,
      thumbnail: thumbnailFile,
    } = await getFileData({ file: uploadedFile, uploadFrom });
    uploadServices.loadThumbnailBase64(thumbnailFile, async (thumbnailBase64) => {
      const thumbFile = typeof thumbnailFile === 'string' ? await fileUtil.dataURLtoFile(thumbnailBase64, fileName) : thumbnailFile;
      setUploadedTemplate({
        fileUpload: newFile,
        uploadFrom,
        thumbnail: {
          file: thumbFile,
          thumbnailBase64,
        },
        name: fileName,
      });
    });
  };

  useEffect(() => {
    TemplateModal.Create.preload();
  }, []);

  return (
    <>
      <Component {...props} onUploadFiles={onUploadFiles} />
      {uploadedTemplate && (
      <TemplateModal.Create
        defaultValues={uploadedTemplate}
        onClose={() => setUploadedTemplate(null)}
        onSubmit={onCreate}
      />
      )}
    </>
  );
};

export default withUploadTemplate;

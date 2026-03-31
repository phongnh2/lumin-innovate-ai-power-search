import classNames from 'classnames';
import { Button, ButtonVariant, Divider } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';
import { Trans } from 'react-i18next';

import GoogleDriveLogo from 'assets/reskin/lumin-svgs/google.svg';

import GoogleFilePicker from 'luminComponents/GoogleFilePicker';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks/useTranslation';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';

import { UPLOAD_FILE_TYPE } from 'constants/customConstant';

import { MergePanelContext } from '../MergePanel';

import styles from './EmptyView.module.scss';

const EmptyView = () => {
  const { handleLocalFileChange, inputFileRef, googlePickerFileRef, handleGoogleFileChange, isDragActive } =
    useContext(MergePanelContext);
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div
        className={classNames(styles.uploadHeader, {
          [styles.dragActive]: isDragActive,
        })}
        onClick={() => inputFileRef.current.click()}
        role="button"
        tabIndex={0}
      >
        <input
          type="file"
          ref={inputFileRef}
          onChange={handleLocalFileChange}
          hidden
          accept={featureStoragePolicy.getSupportedMimeTypes(AppFeatures.MERGE_FILE).join(',')}
          multiple
        />
        <SvgElement className={styles.logo} content="upload-merge-document" />
        <Trans
          i18nKey="viewer.mergePagePanel.dropZone"
          components={{ p: <p className={styles.description} />, u: <u className={styles.link} /> }}
          className={styles.description}
        />
      </div>

      <div className={styles.divider}>
        <Divider className={styles.dividerLine} />
        <p className={styles.dividerText}>{t('viewer.mergePagePanel.divider')}</p>
        <Divider className={styles.dividerLine} />
      </div>

      <GoogleFilePicker
        onPicked={handleGoogleFileChange}
        uploadType={UPLOAD_FILE_TYPE.DOCUMENT}
        multiSelect
        mimeType={featureStoragePolicy.getSupportedMimeTypes(AppFeatures.MERGE_FILE).join(',')}
        isUpload={false}
      >
        <Button
          classNames={{
            root: styles.uploadFromButton,
          }}
          variant={ButtonVariant.elevated}
          size="lg"
          startIcon={<img src={GoogleDriveLogo} alt="upload from Google Drive" width={18} height={18} />}
          ref={googlePickerFileRef}
        >
          Google Drive
        </Button>
      </GoogleFilePicker>
    </div>
  );
};

export default EmptyView;

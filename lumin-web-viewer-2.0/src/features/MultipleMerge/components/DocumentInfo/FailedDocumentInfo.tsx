import classNames from 'classnames';
import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { memo } from 'react';

import FileErrorImage from 'assets/lumin-svgs/file-error.svg';

import { useTranslation } from 'hooks';

import { ERROR_CODE_MAPPER } from '../../constants';
import { UploadDocumentError, UploadDocumentErrorType } from '../../enum';

import styles from './DocumentInfo.module.scss';

type Props = {
  errorCode?: UploadDocumentErrorType;
  name: string;
};

const FailedDocumentInfo = ({ errorCode, name }: Props) => {
  const { t } = useTranslation();
  const { key, reason } = ERROR_CODE_MAPPER[errorCode || UploadDocumentError.FAILED_TO_UPLOAD] || {};

  return (
    <>
      <img src={FileErrorImage} alt="Upload file error" className={styles.failedThumbnail} />
      <div className={styles.documentNameAndSize}>
        <p className={classNames([styles.name, styles.uploadFailedName])}>{name}</p>
        <div className={styles.extraInfoContainer}>
          <PlainTooltip
            content={t(key, {
              reason: t(reason),
            })}
          >
            <p className={classNames([styles.extraInfo, styles.uploadFailedExtraInfo])}>
              {t(key, {
                reason: t(reason),
              })}
            </p>
          </PlainTooltip>
        </div>
      </div>
    </>
  );
};

export default memo(FailedDocumentInfo);

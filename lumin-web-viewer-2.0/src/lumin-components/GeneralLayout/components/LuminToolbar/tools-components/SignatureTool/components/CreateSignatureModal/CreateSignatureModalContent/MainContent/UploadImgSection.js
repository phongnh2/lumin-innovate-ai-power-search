/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
import React, { useContext, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks/useTranslation';

import compressImage,{ convertDimensionToPixels } from 'utils/compressImage';

import { images } from 'constants/documentType';
import { DEFAULT_SIGNATURE_MAXIMUM_DIMENSION } from 'constants/signatureConstant';

import { CreateSignatureModalContentContext } from './CreateSignatureModalContentContext';

import * as Styled from './MainContent.styled';

const MIN_IMAGE_FILE_SIZE_TO_COMPRESS = 500 * 1024;

const UploadImgSection = () => {
  const { t } = useTranslation();
  const { imageSignatureRef, imageSignature, handleUploadFile, imgInputRef } = useContext(
    CreateSignatureModalContentContext
  );
  const pickupFile = () => {
    imgInputRef.current.click();
  };

  const compressSignatureImage = async (file) => {
    if (file.size > MIN_IMAGE_FILE_SIZE_TO_COMPRESS) {
      const { width } = convertDimensionToPixels({
        width: DEFAULT_SIGNATURE_MAXIMUM_DIMENSION,
        height: DEFAULT_SIGNATURE_MAXIMUM_DIMENSION,
      });
      return compressImage(file, {
        mimeType: 'jpeg',
        minWidth: width,
      });
    }
    return file;
  };

  const onDrop = async (files) => {
    const [file] = files;
    if (file) {
      handleUploadFile(null, await compressSignatureImage(file));
    }
  };

  const onInputChange = async (e) => {
    const [file] = e.target.files;
    handleUploadFile(e, await compressSignatureImage(file));
  };

  const { getRootProps, isDragActive } = useDropzone({
    disabled: !!imageSignature,
    noClick: true,
    noKeyboard: true,
    onDrop,
    maxFiles: 1,
    accept: ['.png', '.jpeg', '.jpg'],
  });

  const rootProps = useMemo(getRootProps, [getRootProps]);

  const shouldShowEmptyContent = useMemo(() => !imageSignature && !isDragActive, [imageSignature, isDragActive]);
  return (
    <Styled.UploadImgSection $haveImgcontent={imageSignature} {...rootProps}>
      {isDragActive && (
        <>
          <Styled.DropIndicator>
            <SvgElement content="drop-img" width={44} height={44} />

            <Styled.DropIndicatorText>{t('generalLayout.signAndSend.dropYourImageHere')}</Styled.DropIndicatorText>
          </Styled.DropIndicator>

          <Styled.DropIndicatorBackDrop />
        </>
      )}

      {shouldShowEmptyContent && (
        <Styled.UploadImgEmptyContent>
          <SvgElement content="img" width={44} height={44} />
          <Styled.BaseLine>{t('generalLayout.signAndSend.dropYourImageHere')}</Styled.BaseLine>
          <Styled.BaseLine>
            {t('generalLayout.signAndSend.or')}{' '}
            <Styled.Anchor onClick={pickupFile}>{t('generalLayout.signAndSend.browseFile')}</Styled.Anchor>
          </Styled.BaseLine>
        </Styled.UploadImgEmptyContent>
      )}

      <input
        type="file"
        id="file"
        ref={imgInputRef}
        style={{ display: 'none' }}
        onChange={onInputChange}
        accept={`
            ${images.PNG},
            ${images.JPG},
            ${images.JPEG},
        `}
      />

      <Styled.DemoImg
        $visible={imageSignature}
        alt="image-signature"
        className="image-signature"
        ref={imageSignatureRef}
      />
    </Styled.UploadImgSection>
  );
};

export default UploadImgSection;

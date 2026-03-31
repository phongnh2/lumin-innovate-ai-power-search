import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import AvatarUploader from 'lumin-components/AvatarUploader';
import Icomoon from 'lumin-components/Icomoon';
import Alert from 'lumin-components/Shared/Alert';
import Input from 'lumin-components/Shared/Input';
import Textarea from 'lumin-components/Shared/Textarea';
import Tooltip from 'lumin-components/Shared/Tooltip';
import SvgElement from 'lumin-components/SvgElement';

// import TemplateDestinationModal from 'lumin-components/TemplateDestinationModal';
import { useTrackFormEvent, useTranslation } from 'hooks';

import { uploadServices } from 'services';

import { yupUtils as Yup, getFileService, validator, avatar } from 'utils';

import { thumbnailSizeLimit, UPLOAD_IMAGE_TYPES } from 'constants/customConstant';
import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';
import {
  ERROR_MESSAGE_TEMPLATE,
  ERROR_MESSAGE_NOT_CONTAIN_URL,
  ERROR_MESSAGE_INVALID_FIELD,
} from 'constants/messages';
import { Colors } from 'constants/styles';
import { MAX_LENGTH_TEMPLATE_DESCRIPTION, MAX_LENGTH_TEMPLATE_NAME, TEMPLATE_FIELD } from 'constants/templateConstant';

import useTemplateDestination from './hooks/useTemplateDestination';

import * as Styled from './TemplateModal.styled';

/**
 * @deprecated old layout
 */
function TemplateController({
  title,
  submitLabel,
  defaultValues,
  isEditMode,
  onSubmit,
  onClose,
  hasDestination,
  showNotify,
  formEvent,
}) {
  const { t } = useTranslation();
  const {
    templateId,
    name: defaultName,
    thumbnail: defaultThumbnail,
    description: defaultDescription = '',
    fileUpload,
    uploadFrom,
    documentType,
    clientId,
    isShared,
  } = defaultValues;
  const disabledClickDestination =
    !isShared && [DOCUMENT_TYPE.ORGANIZATION, DOCUMENT_TYPE.ORGANIZATION_TEAM].includes(documentType);
  const { trackInputChange, trackSubmitForm } = useTrackFormEvent();
  const { initialDestination, isPersonalDocument, textTooltip } = useTemplateDestination({
    documentType,
    clientId,
    isShared,
  });

  const schema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .trim()
          .required(t('errorMessage.fieldRequired'))
          .max(
            MAX_LENGTH_TEMPLATE_NAME,
            t(
              ERROR_MESSAGE_TEMPLATE.TEMPLATE_NAME_LENGTH.key,
              ERROR_MESSAGE_TEMPLATE.TEMPLATE_NAME_LENGTH.interpolation
            )
          )
          .notContainUrl(t(ERROR_MESSAGE_NOT_CONTAIN_URL))
          .notContainHtml(t(ERROR_MESSAGE_INVALID_FIELD)),
        description: Yup.string()
          .trim()
          .required(t('errorMessage.fieldRequired'))
          .test('ValidateXSS', 'This field is invalid.', (value) => validator.validateNameHtml(value))
          .max(
            MAX_LENGTH_TEMPLATE_DESCRIPTION,
            t(
              ERROR_MESSAGE_TEMPLATE.TEMPLATE_DESCRIPTION_LENGTH.key,
              ERROR_MESSAGE_TEMPLATE.TEMPLATE_DESCRIPTION_LENGTH.interpolation
            )
          ),
        isNotify: Yup.boolean(),
      }),
    []
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: {
      isValid, isDirty, isSubmitting, errors,
    },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: defaultName.replace('.', '-'),
      thumbnail: defaultThumbnail,
      description: defaultDescription,
      destination: initialDestination,
    },
    resolver: yupResolver(schema),
  });
  const destinationDisabled = isSubmitting || disabledClickDestination;
  const destinationClasses = Styled.useStyles({ destinationDisabled });
  const [thumbnail, destination] = useWatch({
    control,
    name: ['thumbnail', 'destination'],
  });
  const [errorMessage, setError] = useState('');
  const [isShowDestination, setIsShowDestination] = useState(false);
  const [isRemoveThumbnail, setIsRemoveThumbnail] = useState(false);
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};

  const shouldShowNotify = showNotify || (hasDestination && destination.source === DOCUMENT_TYPE.ORGANIZATION);

  const isDestinationModalOpen = isShowDestination && hasDestination;

  const { file: thumbnailFile } = thumbnail || {};
  const hasThumbnailRemoteId = typeof thumbnailFile === 'string';

  const disableSubmit = !isValid || (isEditMode && !isDirty);
  const isThirdPartyUpload = [STORAGE_TYPE.GOOGLE, STORAGE_TYPE.DROPBOX].includes(uploadFrom);

  const setThumbnail = (value, options) => setValue('thumbnail', value, options);

  const handleSetThumbnail = (uploadedFile) => {
    uploadServices.loadThumbnailBase64(uploadedFile, (thumbnailBase64) => {
      setThumbnail({
        file: uploadedFile,
        thumbnailBase64,
      }, { shouldDirty: true });
      setIsRemoveThumbnail(false);
    });
  };

  const onRemoveThumbnail = () => {
    setError('');
    setThumbnail(null, { shouldDirty: true });
    setIsRemoveThumbnail(true);
  };

  const getParamSubmit = ({
    name, description, thumbnail: _thumbnail, destination: _destination, isNotify,
  }) => {
    const { file: _thumbnailFile } = _thumbnail || {};
    const uploadThumbnail = !hasThumbnailRemoteId ? _thumbnailFile : null;

    if (hasDestination) {
      return {
        document: {
          ...defaultValues,
          name: `${defaultValues.name}.pdf`,
        },
        destination: _destination,
        templateData: {
          name: name.trim(),
          description: description.trim(),
        },
        thumbnailFile: uploadThumbnail,
        isNotify,
        handleSubmitError: setError,
        isRemoveThumbnail,
      };
    }

    return {
      templateId,
      name: name.trim(),
      description: description.trim(),
      thumbnail: uploadThumbnail,
      isRemoveThumbnail,
      file: fileUpload,
      uploadFrom,
      isNotify,
    };
  };

  const submit = async (params, event) => {
    setError('');
    const data = getParamSubmit(params);
    trackSubmitForm(event);
    const response = await onSubmit(data) || {};

    if (!response.error) {
      onClose();
    }
  };

  const onDescriptionChange = (callback) => (e, ...rest) => {
    trackInputChange(e);
    callback(e, ...rest);
  };

  const renderUploadThumbnail = () => (
    <Styled.UploadContainer>
      <Styled.Label>{t('common.thumbnail')}</Styled.Label>

      <Styled.ThumbnailUploadContainer>
        <Controller
          control={control}
          name="thumbnail"
          render={({ field: { value } }) => {
            const { file: _thumbnailFile, thumbnailBase64: _thumbnailBase64 } = value || {};
            const thumbnailSource = hasThumbnailRemoteId
              ? getFileService.getThumbnailUrl(_thumbnailFile)
              : _thumbnailBase64;

            return (
              <AvatarUploader
                disabled={isSubmitting}
                avatarSource={thumbnailSource}
                defaultAvatar={<SvgElement content="default-template" width={32} />}
                avatarBackgroundColor={Colors.NEUTRAL_0}
                onChange={handleSetThumbnail}
                removeAvatar={onRemoveThumbnail}
                sizeLimit={thumbnailSizeLimit}
                size={64}
                note={t('createBaseOnForm.limitSizeImage', { size: avatar.getAvatarFileSizeLimit(thumbnailSizeLimit) })}
                variant="square"
                onError={setError}
                uploadType={UPLOAD_IMAGE_TYPES.THUMBNAIL}
                showInModal
                hasBorder
                {...(formEvent && {
                  inputName: formEvent[TEMPLATE_FIELD.THUMBNAIL],
                })}
              />
            );
          }}
        />
      </Styled.ThumbnailUploadContainer>
    </Styled.UploadContainer>
  );

  const renderNameField = () => (
    <Styled.InputContainer>
      <Controller
        control={control}
        name="name"
        render={(({ field: { ref: _ref, ...rest } }) => (
          <Input
            label={(
              <>
                {t('common.name')} <span style={{ color: Colors.SECONDARY_50 }}>*</span>
              </>
            )}
            placeholder={t('createBaseOnForm.inputTemplateNameHere')}
            errorMessage={errors.name?.message}
            showClearButton
            hideValidationIcon
            disabled={isSubmitting}
            autoFocus
            {...rest}
            {...(formEvent && {
              name: formEvent[TEMPLATE_FIELD.NAME],
            })}
          />
        ))}
      />
    </Styled.InputContainer>
  );

  const renderDescriptionField = () => (
    <Styled.InputContainer>
      <Controller
        control={control}
        name="description"
        render={(({
          field: {
            ref: _ref, value, onChange, ...rest
          },
        }) => (
          <Textarea
            label={(
              <>
                {t('common.description')}{' '}
                <span style={{ color: Colors.SECONDARY_50 }}>*</span>{' '}
                ({value.length}/1000)
              </>
            )}
            value={value}
            placeholder={t('createBaseOnForm.inputDescriptionHere')}
            maxLength={1000}
            errorMessage={errors.description?.message}
            disabled={isSubmitting}
            onChange={onDescriptionChange(onChange)}
            {...rest}
            {...(formEvent && {
              name: formEvent[TEMPLATE_FIELD.DESCRIPTION],
            })}
          />
        ))}
      />
    </Styled.InputContainer>
  );

  const renderDestinationLabel = () => (
    <Styled.LabelWrapper>
      <Styled.LabelInput>
        {t('common.destination')}
      </Styled.LabelInput>
      {!isPersonalDocument && (
        <Tooltip title={textTooltip} tooltipStyle={{ maxWidth: 400 }}>
          <Icomoon className="info" color={Colors.NEUTRAL_60} size={12} />
        </Tooltip>
      )}
    </Styled.LabelWrapper>
  );

  const renderDestinationField = () => (
    <Styled.InputContainer>
      <Controller
        control={control}
        name="destination"
        render={(({ field: { ref: _ref, value, ...rest } }) => (
          <Input
            label={renderDestinationLabel()}
            value={value.content}
            placeholder={t('createBaseOnForm.searchDestination')}
            icon="search"
            disabled={destinationDisabled}
            readOnly
            pointer
            onClick={() => setIsShowDestination(true)}
            classes={destinationClasses}
            {...rest}
            {...(formEvent && {
              name: formEvent[TEMPLATE_FIELD.DESTINATION],
            })}
          />
        ))}
      />
    </Styled.InputContainer>
  );

  const renderCheckbox = () => {
    const totalMember = hasDestination ? destination?.extra?.totalMember : currentOrganization.totalActiveMember;

    return (
      <Controller
        control={control}
        name="isNotify"
        defaultValue={false}
        render={(({ field: { value, onChange } }) => (
          <Styled.CheckboxWrapper>
            <Styled.Checkbox
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={isSubmitting}
            />
            <Styled.BottomText $disabled={isSubmitting}>
              {t('createBaseOnForm.notifyThisAction', { text: totalMember > 20 ? 'administrators' : 'circle members' })}
            </Styled.BottomText>
          </Styled.CheckboxWrapper>
        ))}
      />
    );
  };

  return (
    <Styled.ModalContainer
      open
      onClose={onClose}
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      scroll="body"
      hasOverlapped={isDestinationModalOpen}
      {...(formEvent && {
        'data-lumin-form-name': formEvent.formName,
        'data-lumin-form-purpose': formEvent.formPurpose,
      })}
    >
      <Styled.Title>{title}</Styled.Title>
      {errorMessage && <Alert style={{ marginBottom: 12 }}>{errorMessage}</Alert>}

      {renderUploadThumbnail()}

      {renderNameField()}

      {renderDescriptionField()}

      {hasDestination && renderDestinationField()}

      {!isEditMode && isThirdPartyUpload && (
        <Styled.ThirdPartyNote>{t('createBaseOnForm.willBeSavedAtLumin')}</Styled.ThirdPartyNote>
      )}

      {shouldShowNotify && renderCheckbox()}

      <Styled.ButtonGroup
        onSubmit={handleSubmit(submit)}
        label={submitLabel}
        loading={isSubmitting}
        disabled={disableSubmit}
        onCancel={onClose}
        disabledCancel={isSubmitting}
      />

    </Styled.ModalContainer>
  );
}

TemplateController.propTypes = {
  title: PropTypes.string,
  submitLabel: PropTypes.string,
  isEditMode: PropTypes.bool,
  showNotify: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  defaultValues: PropTypes.shape({
    _id: PropTypes.string,
    templateId: PropTypes.string,
    name: PropTypes.string.isRequired,
    thumbnail: PropTypes.oneOfType([
      PropTypes.shape({
        file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        thumbnailBase64: PropTypes.string,
      }),
      PropTypes.string,
    ]),
    fileUpload: PropTypes.object,
    uploadFrom: PropTypes.oneOf(Object.values(STORAGE_TYPE)),
    description: PropTypes.string,
    documentType: PropTypes.string,
    clientId: PropTypes.string,
    isShared: PropTypes.bool,
  }),
  hasDestination: PropTypes.bool,
  formEvent: PropTypes.object,
};
TemplateController.defaultProps = {
  title: '',
  submitLabel: 'Save',
  isEditMode: false,
  defaultValues: {},
  showNotify: false,
  onClose: () => {},
  onSubmit: () => {},
  hasDestination: false,
  formEvent: null,
};

export default TemplateController;

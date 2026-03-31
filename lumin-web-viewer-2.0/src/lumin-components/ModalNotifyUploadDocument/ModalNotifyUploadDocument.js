import { makeStyles } from '@mui/styles';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';
import SvgElement from 'lumin-components/SvgElement';
import CustomCheckbox from 'luminComponents/CustomCheckbox';
import Dialog from 'luminComponents/Dialog';

import { useEnableWebReskin } from 'hooks/useEnableWebReskin';
import useGetUserOrgForUpload from 'hooks/useGetUserOrgForUpload';
import { useTranslation } from 'hooks/useTranslation';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION } from 'constants/organizationConstants';

import {
  StyledFormControlLabel,
  StyledTitle,
  StyledDesc,
  StyledMainIcon,
  StyledOrgName,
  StyledButton,
  StyledFooter,
  StyledOrgNameReskin,
} from './ModalNotifyUploadDocument.styled';

const useStyles = makeStyles((theme) => ({
  paper: {
    maxWidth: 400,
    width: '100%',
    padding: 24,
    boxSizing: 'border-box',
    [theme.breakpoints.down('xs')]: {
      padding: 16,
    },
  },
}));

function ModalNotifyUploadDocument({ open, onCancel, onConfirm }) {
  const dispatch = useDispatch();

  const [isChecked, setChecked] = useState(false);
  const currentOrganization = useGetUserOrgForUpload();
  const { isEnableReskin } = useEnableWebReskin();
  const { isViewer } = useViewerMatch();
  const onChange = (e) => {
    const { checked } = e.target;
    setChecked(checked);
  };
  const classes = useStyles();
  const { t } = useTranslation();
  const organizationName = get(currentOrganization, 'name', null) || get(currentOrganization, 'domain', null);
  const isOverSizeLimitForNoti =
    get(currentOrganization, 'totalActiveMember', 0) > MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION;

  useEffect(() => {
    if (isEnableReskin && open) {
      const modalConfig = {
        title: t('common.notify'),
        message: (
          <span>
            <Trans
              i18nKey={isOverSizeLimitForNoti ? 'modalUploadDoc.notifyAdmin' : 'modalUploadDoc.notifyMember'}
              values={{ orgName: organizationName }}
              components={{ b: <StyledOrgNameReskin /> }}
            />
          </span>
        ),
        confirmButtonTitle: t('common.yes'),
        cancelButtonTitle: t('common.no'),
        checkboxMessage: t('common.doNotShowAgain'),
        onConfirm,
        onCancel,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      };

      if (isViewer) {
        dispatch(actions.openViewerModal(modalConfig));
      } else {
        dispatch(
          actions.openModal({
            ...modalConfig,
            useReskinModal: true,
          })
        );
      }
    }
  }, [isOverSizeLimitForNoti, isEnableReskin, organizationName, open, isViewer]);

  if (isEnableReskin) {
    return null;
  }

  return (
    <Dialog classes={classes} open={open}>
      <StyledMainIcon>
        <SvgElement
          content="icon-info"
          width={48}
          height={48}
        />
      </StyledMainIcon>
      <StyledTitle>{t('common.notify')}</StyledTitle>
      <StyledDesc>
        <Trans
          i18nKey={isOverSizeLimitForNoti ? 'modalUploadDoc.notifyAdmin' : 'modalUploadDoc.notifyMember'}
          values={{ orgName: organizationName }}
          components={{ b: <StyledOrgName /> }}
        />
      </StyledDesc>
      <StyledFormControlLabel
        control={<CustomCheckbox type="checkbox" onChange={onChange} />}
        label={t('common.doNotShowAgain')}
        checked={isChecked}
      />
      <StyledFooter>
        <StyledButton
          isCancel
          color={ButtonColor.TERTIARY}
          onClick={() => onCancel(isChecked)}
          size={ButtonSize.XL}
        >
          {t('common.no')}
        </StyledButton>
        <StyledButton
          onClick={() => onConfirm(isChecked)}
          size={ButtonSize.XL}
        >
          {t('common.yes')}
        </StyledButton>
      </StyledFooter>
    </Dialog>
  );
}

ModalNotifyUploadDocument.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

ModalNotifyUploadDocument.defaultProps = {
  open: false,
  onCancel: () => {},
  onConfirm: () => {},
};

export default ModalNotifyUploadDocument;

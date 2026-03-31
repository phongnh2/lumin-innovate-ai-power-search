import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Axios from '@libs/axios';

import ButtonMaterial, { ButtonColor } from 'lumin-components/ButtonMaterial';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import SvgElement from 'lumin-components/SvgElement';
import Dialog from 'luminComponents/Dialog';

import { useTabletMatch, useTranslation } from 'hooks';

import logger from 'helpers/logger';

import { toastUtils } from 'utils';
import errorExtract from 'utils/error';

import { ModalTypes } from 'constants/lumin-common';

import {
  StyledContainer,
  StyledTitle,
  StyledDescription,
  StyledButtonWrapper,
} from './ExportDataModal.styled';

function ExportDataModal(props) {
  const { t } = useTranslation();
  const isTablet = useTabletMatch();
  const { open, setOpen, currentUser } = props;
  const [loading, setLoading] = useState(false);
  const onCloseDialog = () => setOpen(false);
  const onExportDataClick = async () => {
    try {
      setLoading(true);
      const response = await Axios.axiosInstance.get('/events/export-personal-data', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export-data-${currentUser._id}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(false);
      onCloseDialog();
    } catch (error) {
      setLoading(false);
      const { message: errorMessage } = errorExtract.extractGqlError(error);
      logger.logError({
        error,
        message: errorMessage,
        reason: 'onExportDataClick',
      });
      toastUtils.openToastMulti({
        message: t('settingPreferences.errorExportData'),
        type: ModalTypes.ERROR,
      });
    }
  };
  const DIALOG_WIDTH = isTablet ? 400 : 328;
  return (
    <Dialog
      open={open}
      onClose={onCloseDialog}
      disableBackdropClick={loading}
      disableEscapeKeyDown={loading}
      width={DIALOG_WIDTH}
    >
      <StyledContainer>
        <SvgElement content="icon-info" width={48} height={48} />
        <StyledTitle>{t('settingPreferences.exportYourDataLog')}</StyledTitle>
        <StyledDescription>{t('settingPreferences.descExportYourDataLog')}</StyledDescription>
        <StyledButtonWrapper>
          <ButtonMaterial
            color={ButtonColor.TERTIARY}
            disabled={loading}
            onClick={onCloseDialog}
            size={isTablet ? ButtonSize.XL : ButtonSize.MD}
          >
            {t('common.cancel')}
          </ButtonMaterial>
          <ButtonMaterial
            disabled={loading}
            onClick={onExportDataClick}
            loading={loading}
            size={isTablet ? ButtonSize.XL : ButtonSize.MD}
          >
            {t('settingPreferences.export')}
          </ButtonMaterial>
        </StyledButtonWrapper>
      </StyledContainer>
    </Dialog>
  );
}

ExportDataModal.defaultProps = {};
ExportDataModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
};

export default ExportDataModal;

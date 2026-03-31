import PropTypes from 'prop-types';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import { useThemeMode, useTranslation } from 'hooks';

import * as Styled from './GoogleDriveFolder.styled';

const defaultProps = {
  isSubmitting: false,
};

const propTypes = {
  isSubmitting: PropTypes.bool,
  folderIcon: PropTypes.string.isRequired,
  folderLocation: PropTypes.string.isRequired,
  openGooleFolderpicker: PropTypes.func.isRequired,
};

const GoogleDriveFolder = ({ isSubmitting = false, folderIcon, folderLocation, openGooleFolderpicker }) => {
  const themeMode = useThemeMode();
  const { t } = useTranslation();

  return (
    <ThemeProvider theme={Styled.theme[themeMode]}>
      <Styled.LocationHolder>
        <Styled.LocationField>
          <Styled.FormFieldLabel>{t('modal.location')}</Styled.FormFieldLabel>
          <Styled.IconStyled size={18} className={folderIcon} />
          <Styled.LocationContent>{folderLocation}</Styled.LocationContent>
        </Styled.LocationField>
        <Styled.ChangeInput isSubmit={isSubmitting} onClick={openGooleFolderpicker} disabled={isSubmitting}>
          {t('common.change')}
        </Styled.ChangeInput>
      </Styled.LocationHolder>
    </ThemeProvider>
  );
};

GoogleDriveFolder.defaultProps = defaultProps;
GoogleDriveFolder.propTypes = propTypes;

export default GoogleDriveFolder;

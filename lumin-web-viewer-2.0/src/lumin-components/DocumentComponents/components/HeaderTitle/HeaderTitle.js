import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo } from 'react';

import LuminLogo from 'assets/lumin-svgs/logo-lumin.svg';

import { DocumentSearchContext } from 'lumin-components/Document/context';
import PageTitlePortal from 'lumin-components/PortalElement/PageTitlePortal';
import SearchDocument from 'lumin-components/SearchDocument';
import UploadButton from 'lumin-components/UploadButton';
import OneDriveFilePickerProvider from 'luminComponents/OneDriveFilePicker/OneDriveFilePickerProvider';

import {
  useDesktopMatch,
  useGetCurrentTeam,
  useGetFolderType,
  useTabletMatch,
  useTranslation,
  useEnableWebReskin,
} from 'hooks';

import * as Styled from './HeaderTitle.styled';

function HeaderTitle({ setSearchKey, canUpload, folder, leftTitle }) {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const isDesktopUpMatch = useDesktopMatch();
  const isTabletUpMatch = useTabletMatch();
  const currentFolderType = useGetFolderType();
  const currentTeam = useGetCurrentTeam();
  const { isSearchView, isFocusing, setFocusing } = useContext(DocumentSearchContext);

  const onSearch = useCallback(
    (value) => {
      setSearchKey(value);
    },
    [setSearchKey]
  );

  const folderName = folder.name;

  const getPlaceholder = () => {
    if (isFocusing && !folderName) {
      return t('navbar.searchByFolder');
    }

    return t('common.search');
  };

  const reskinTitleElement = useMemo(
    () => (
      <Styled.LuminLogoWrapper to="/">
        <Styled.LuminLogoReskin src={LuminLogo} alt="Lumin logo" />
      </Styled.LuminLogoWrapper>
    ),
    []
  );

  const header = useMemo(() => {
    if (isTabletUpMatch) {
      return (
        <Styled.HeaderTabletUp>
          <SearchDocument
            onChange={onSearch}
            leftElement={leftTitle}
            folderName={folderName}
            animate
            isSearchView={isSearchView}
            setFocusing={setFocusing}
            placeholder={getPlaceholder()}
            resetOn={[currentFolderType, currentTeam?._id]}
          />
          {canUpload && (
            <OneDriveFilePickerProvider>
              <UploadButton folder={folder} />
            </OneDriveFilePickerProvider>
          )}
        </Styled.HeaderTabletUp>
      );
    }

    return (
      <Styled.HeaderMobile>
        {leftTitle}
        <SearchDocument
          onChange={onSearch}
          folderName={folderName}
          isSearchView={isSearchView}
          setFocusing={setFocusing}
          placeholder={getPlaceholder()}
          resetOn={[currentFolderType, currentTeam?._id]}
        />
      </Styled.HeaderMobile>
    );
  }, [canUpload, isTabletUpMatch, leftTitle, folderName, isSearchView, currentFolderType]);

  if (isEnableReskin) {
    return <PageTitlePortal.Element>{reskinTitleElement}</PageTitlePortal.Element>;
  }
  return isDesktopUpMatch ? <PageTitlePortal.Element>{header}</PageTitlePortal.Element> : header;
}

HeaderTitle.propTypes = {
  setSearchKey: PropTypes.func.isRequired,
  canUpload: PropTypes.bool.isRequired,
  leftTitle: PropTypes.node.isRequired,
  folder: PropTypes.object,
};

HeaderTitle.defaultProps = {
  folder: {},
};
export default React.memo(HeaderTitle);

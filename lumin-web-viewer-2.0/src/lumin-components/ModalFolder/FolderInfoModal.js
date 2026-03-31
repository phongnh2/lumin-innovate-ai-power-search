import { Grid } from '@mui/material';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { useAsync } from 'react-use';

import CircularLoading from 'lumin-components/CircularLoading';
import ModalFooter from 'lumin-components/ModalFooter';
import Dialog from 'luminComponents/Dialog';

import { FolderServices } from 'services';

import { dateUtil } from 'utils';

import { FolderType, FOLDER_INFO_KEY } from 'constants/folderConstant';
import { ModalSize } from 'constants/styles/Modal';

import * as Styled from './ModalFolder.styled';

const propTypes = {
  open: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(Object.values(FolderType)),
  folder: PropTypes.object.isRequired,
  closeDialog: PropTypes.func.isRequired,
};

const defaultProps = {
  type: FolderType.PERSONAL,
};

function FolderInfoModal(props) {
  const {
    open, type, folder, closeDialog,
  } = props;

  const folderServices = new FolderServices(type);
  const { value: folderInfo, loading, error } = useAsync(
    () => folderServices.getDetail(folder._id),
    [folder._id],
  );

  const renderRow = (leftEl, rightEl) => (
    <Styled.InfoRow key={leftEl}>
      <Grid container>
        <Grid item xs={6}>
          <Styled.InfoRowTitle>{leftEl}</Styled.InfoRowTitle>
        </Grid>
        <Grid item xs={6}>
          <Styled.InfoRowContent>
            {rightEl}
          </Styled.InfoRowContent>
        </Grid>
      </Grid>
    </Styled.InfoRow>
  );

  const renderFolderInfo = () => {
    const {
      folder: {
        name,
        createdAt,
        totalDocument,
      } = {},
      creatorName,
      organizationName,
      teamName,
    } = folderInfo;

    const folderFields = [
      {
        key: FOLDER_INFO_KEY.NAME,
        title: 'Folder name',
        value: name,
      },
      {
        key: FOLDER_INFO_KEY.LOCATION,
        title: 'Location',
        value: folderServices.getLocation({ organizationName, teamName }),
      },
      {
        key: FOLDER_INFO_KEY.CREATOR_NAME,
        title: 'Creator',
        value: creatorName,
      },
      {
        key: FOLDER_INFO_KEY.CREATED_AT,
        title: 'Creation date',
        value: dateUtil.formatMDYTime(new Date(createdAt * 1)),
      },
      {
        key: FOLDER_INFO_KEY.TOTAL_DOCUMENT,
        title: 'Documents number',
        value: totalDocument,
      },
    ];

    return folderFields.map(({ key, title, value }) => {
      const shouldRenderDivider = key === FOLDER_INFO_KEY.NAME;
      return (
        <Fragment key={key}>
          {renderRow(title, value)}
          {shouldRenderDivider && <Styled.InfoDivider />}
        </Fragment>
      );
    });
  };

  return (
    <Dialog
      open={open}
      width={ModalSize.SM}
      onClose={closeDialog}
    >
      {(loading || error) ? (
        <Styled.InfoLoading>
          <CircularLoading size={32} />
        </Styled.InfoLoading>
      ) : (
        <Styled.InfoContainer>
          <Styled.InfoDialogTitle>
            <Styled.InfoTitle>Folder Info</Styled.InfoTitle>
          </Styled.InfoDialogTitle>
          {renderFolderInfo()}
          <Styled.InfoButtonWrapper>
            <ModalFooter
              onSubmit={closeDialog}
            />
          </Styled.InfoButtonWrapper>
        </Styled.InfoContainer>
      )}
    </Dialog>
  );
}

FolderInfoModal.propTypes = propTypes;
FolderInfoModal.defaultProps = defaultProps;

export default FolderInfoModal;

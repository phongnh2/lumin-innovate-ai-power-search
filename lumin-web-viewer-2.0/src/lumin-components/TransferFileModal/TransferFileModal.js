/* eslint-disable react/prop-types */
import Grid from '@mui/material/Grid';
import React from 'react';

import ButtonMaterial from 'luminComponents/ButtonMaterial';
import Dialog from 'luminComponents/Dialog';
import SvgElement from 'luminComponents/SvgElement';

import { file, string } from 'utils';
import './TransferFileModal.scss';

const TransferFileModal = ({ open, onClose, currentDocument, onConfirm }) => (
    <Dialog open={open} onClose={onClose} className='TransferFileModal'>
      <div className='TransferFileModal__container'>
        <SvgElement className='TransferFileModal__icon' content={`${currentDocument.service}-transfer`} width={170} height={36} />
        <div className='TransferFileModal__title'>
          Are you sure you want to share this file?
    </div>
        <div className='TransferFileModal__message'>
        <span>{string.getShortStringWithLimit(file.getFilenameWithoutExtension(currentDocument.name), 15)}</span> will
        be stored at Lumin Storage if you share it.
    </div>
        <Grid container alignItems='center' spacing={2}>
          <Grid item xs={6}>
            <ButtonMaterial className='secondary' onClick={onClose}>
              Cancel
        </ButtonMaterial>
          </Grid>
          <Grid item xs={6}>
            <ButtonMaterial className='primary' onClick={onConfirm}>
              Share
        </ButtonMaterial>
          </Grid>
        </Grid>
      </div>
    </Dialog>
  );

export default TransferFileModal;

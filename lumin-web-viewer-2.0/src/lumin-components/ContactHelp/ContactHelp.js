import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';

import './ContactHelp.scss';

const TOPICS = ['Sign Up', 'Sign In', 'Forgot Password', 'Document List', 'Edit Viewer', 'Subscription'];

const ContactHelp = () => (
  <div className='ContactHelp'>
    <div className='ContactHelp__title'>How Can We Help You?</div>
    <div className='ContactHelp__subtitle'>Please select a topic below related to your inquiry.
If you don’t find what you need, fill out our contact form.</div>
    <MenuList className='ContactHelp__support-list'>
      {
        TOPICS.map((topic, index) => (
          <MenuItem key={index}>
            <Grid container alignItems='center' justify='space-between'>
              <Grid item>{topic}</Grid>
              <Grid item>
                <Icomoon className='next-page icon__16' />
              </Grid>
            </Grid>
          </MenuItem>
        ))
      }
    </MenuList>
  </div>
);

export default ContactHelp;

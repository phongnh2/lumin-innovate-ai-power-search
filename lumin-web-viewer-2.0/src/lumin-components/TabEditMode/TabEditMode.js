/* eslint-disable react/prop-types */
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';

import './TabEditMode.scss';

export const PARAM_TO_HIGHLIGHT = 'action';

const StyledAccordion = withStyles({
  root: {
    '&.Mui-expanded': {
      marginBottom: 0,
      marginTop: 0,
    },
    '&:last-child': {
      borderRadius: 0,
    },
    '&:first-child': {
      borderRadius: 0,
    },
  },
})(Accordion);

const StyledAccordionSummary = withStyles({
  root: {
    padding: '0px 24px 0 16px',
    minHeight: 40,
    '&.Mui-expanded': {
      minHeight: 40,
    },
  },
  content: {
    '&.Mui-expanded': {
      margin: 0,
    },
  },
})(AccordionSummary);

function TabEditMode(props) {
  const { title, component, id, availableWhenOffline, isOffline, isSystemDocument } = props;
  const isToolAvailable = !isOffline || availableWhenOffline || isSystemDocument;
  const toolAutoEnabled = useSelector(selectors.getToolAutoEnabled);

  return (
    <StyledAccordion
      elevation={2}
      className={classNames({
        TabEditMode: true,
        'TabEditMode--disabled': !isToolAvailable,
        'TabEditMode--highlighted': id === toolAutoEnabled,
      })}
    >
      <StyledAccordionSummary
        className="TabEditMode__Title"
        expandIcon={<Icomoon className="arrow-down-alt" size={14} />}
        aria-controls="panel1a-content"
        id={id}
      >
        <p>{title}</p>
      </StyledAccordionSummary>
      <AccordionDetails className="TabEditMode_Details">{component}</AccordionDetails>
    </StyledAccordion>
  );
}

export default TabEditMode;

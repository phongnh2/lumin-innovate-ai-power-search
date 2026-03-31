import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

import Tooltip from 'lumin-components/Shared/Tooltip';
import ButtonIcon from 'luminComponents/Shared/ButtonIcon';

import { useTranslation } from 'hooks';

import { layoutType } from 'constants/documentConstants';

import { StyledWrapper } from './DocumentLayoutType.styled';

const useStyles = makeStyles({
  firstButton: {
    marginRight: 8,
  },
});

function DocumentLayoutType({ onChange, value }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const isActive = (type) => (value === type);
  const buttons = [
    {
      icon: 'listview',
      className: classes.firstButton,
      active: isActive(layoutType.list),
      onClick: () => onChange(layoutType.list),
      tooltip: t('documentPage.listView'),
    },
    {
      icon: 'gridview',
      className: '',
      active: isActive(layoutType.grid),
      onClick: () => onChange(layoutType.grid),
      tooltip: t('documentPage.gridView'),
    },
  ];
  return (
    <StyledWrapper>
      {buttons.map(({
        className, active, onClick, icon, tooltip,
      }) => (
        <Tooltip title={tooltip} placement="top" key={icon}>
          <ButtonIcon
            key={icon}
            className={className}
            isActive={active}
            size={32}
            icon={icon}
            onClick={onClick}
          />
        </Tooltip>
      ))}
    </StyledWrapper>
  );
}

DocumentLayoutType.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOf([layoutType.list, layoutType.grid]).isRequired,
};

DocumentLayoutType.defaultProps = {

};

export default DocumentLayoutType;

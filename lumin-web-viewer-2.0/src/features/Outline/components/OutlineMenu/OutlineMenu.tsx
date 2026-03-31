import React from 'react';

import Menu from '@new-ui/general-components/Menu';
import Paper from '@new-ui/general-components/Paper';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { OutlineEvent } from 'features/Outline/types';

import OutlineMenuItem from './OutlineMenuItem';

const OutlineMenu = React.forwardRef(() => {
  const { t } = useTranslation();

  return (
    <Paper elevation={1}>
      <Menu style={{ minWidth: '304px' }}>
        <OutlineMenuItem
          type={OutlineEvent.ADD}
          title={t('outlines.actions.add')}
          data-lumin-btn-name={ButtonName.ADD_OUTLINE}
        />
        <OutlineMenuItem
          type={OutlineEvent.ADD_SUB}
          title={t('outlines.actions.addSub')}
          data-lumin-btn-name={ButtonName.ADD_SUB_OUTLINE}
        />
        <OutlineMenuItem
          type={OutlineEvent.EDIT}
          title={t('outlines.actions.edit')}
          data-lumin-btn-name={ButtonName.EDIT_OUTLINE}
        />
        <OutlineMenuItem
          type={OutlineEvent.DELETE}
          title={t('outlines.actions.delete')}
          data-lumin-btn-name={ButtonName.DELETE_OUTLINE}
        />
      </Menu>
    </Paper>
  );
});

OutlineMenu.propTypes = {};

export default OutlineMenu;

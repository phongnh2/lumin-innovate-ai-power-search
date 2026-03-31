import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'lumin-components/Shared/MenuItem';
import { TEMPLATE_POPPER_BUTTON } from 'constants/templateConstant';
import { Colors } from 'constants/styles';
import Icomoon from 'lumin-components/Icomoon';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { useTranslation } from 'hooks';
import * as Styled from './TemplateItemPopper.styled';

function TemplateItemPopper({ actions, closePopper, permissions }) {
  const { t } = useTranslation();
  const items = {
    [TEMPLATE_POPPER_BUTTON.ViewInfo]: {
      title: t('common.templateInfo'),
      icon: 'file-info',
      action: actions.info,
    },
    [TEMPLATE_POPPER_BUTTON.EditInfo]: {
      title: t('common.editInfo'),
      icon: 'edit-mode',
      action: actions.edit,
      btnName: ButtonName.EDIT_TEMPLATE,
    },
    [TEMPLATE_POPPER_BUTTON.Publish]: {
      title: t('common.publish'),
      icon: 'world',
      action: actions.publish,
      styles: {
        color: Colors.SECONDARY_50,
      },
    },
    [TEMPLATE_POPPER_BUTTON.Delete]: {
      title: t('common.delete'),
      icon: 'trash',
      action: actions.delete,
    },
  };

  const renderItem = (item) => {
    const {
      styles = {}, title, action, icon, btnName = '',
    } = item;
    const onClick = async () => {
      action();
      closePopper();
    };

    return (
      <MenuItem
        key={title}
        onClick={onClick}
        data-lumin-btn-name={btnName}
      >
        <Styled.ItemContainer>
          <Icomoon
            className={icon}
            size={18}
            color={styles.color || Colors.NEUTRAL_80}
          />
          <span style={styles}>{title}</span>
        </Styled.ItemContainer>
      </MenuItem>
    );
  };

  return (
    <Styled.MenuList>
      {renderItem(items[TEMPLATE_POPPER_BUTTON.ViewInfo])}
      {permissions.canEdit && renderItem(items[TEMPLATE_POPPER_BUTTON.EditInfo])}
      {renderItem(items[TEMPLATE_POPPER_BUTTON.Publish])}
      {permissions.canDelete && renderItem(items[TEMPLATE_POPPER_BUTTON.Delete])}
    </Styled.MenuList>
  );
}

TemplateItemPopper.propTypes = {
  actions: PropTypes.shape({
    info: PropTypes.func.isRequired,
    edit: PropTypes.func,
    publish: PropTypes.func,
    delete: PropTypes.func,
  }),
  closePopper: PropTypes.func.isRequired,
  permissions: PropTypes.object.isRequired,
};
TemplateItemPopper.defaultProps = {
  actions: {},
};

export default TemplateItemPopper;

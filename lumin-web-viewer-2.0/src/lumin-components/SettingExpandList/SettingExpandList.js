import classNames from 'classnames';
import { Button, Icomoon as KiwiIcomoon, Collapse as KiwiCollapse, PlainTooltip, IconButton } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import Icomoon from 'lumin-components/Icomoon';
import Collapse from 'lumin-components/Shared/Collapse';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { Colors } from 'constants/styles';

import * as Styled from './SettingExpandList.styled';

import styles from './SettingExpandList.module.scss';

const SettingExpandList = ({
  title, list, canEdit, onEdit, canDelete, onDelete, buttonElement, isExpandList,
}) => {
  const { isEnableReskin } = useEnableWebReskin();
  const [isExpand, setIsExpand] = useState(isExpandList);
  const { t } = useTranslation();

  useEffect(() => {
    setIsExpand(isExpandList);
  }, [isExpandList]);

  const renderList = () => (
    <>
      {list.map((item, index) => (
        <Styled.ListItem key={index}>
          <Styled.ListItemText>{item}</Styled.ListItemText>
          <Styled.ListItemIconWrapper>
            {canEdit && (
              <Tooltip title={t('common.edit')}>
                <Styled.ButtonIcon icon="edit-team" iconSize={18} onClick={() => onEdit(item)} />
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title={t('common.delete')}>
                <Styled.ButtonIcon icon="trash" iconSize={18} onClick={() => onDelete(item)} />
              </Tooltip>
            )}
          </Styled.ListItemIconWrapper>
        </Styled.ListItem>
      ))}
    </>
  );

  const renderListDomain = () => (
    <>
      {list.map((item, index) => (
        <div key={index} className={styles.listItem}>
          <div className={styles.domainText}>{item}</div>
          <div className={styles.listIconWrapper}>
            {canEdit && (
              <PlainTooltip content={t('common.edit')}>
                <IconButton icon="pencil-lg" size="lg" onClick={() => onEdit(item)} />
              </PlainTooltip>
            )}
            {canDelete && (
              <PlainTooltip content={t('common.delete')}>
                <IconButton icon="trash-lg" size="lg" onClick={() => onDelete(item)} />
              </PlainTooltip>
            )}
          </div>
        </div>
      ))}
    </>
  );

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <div className={styles.headerWrapper}>
          <div className={styles.title}>{title}</div>
          <Button
            onClick={() => setIsExpand((prevState) => !prevState)}
            variant="text"
            endIcon={
              <div
                className={classNames(styles.iconWrapper, {
                  [styles.rotate180Deg]: isExpand,
                  [styles.rotate0Deg]: !isExpand,
                })}
              >
                <KiwiIcomoon type="chevron-down-md" size="md" />
              </div>
            }
          >
            {isExpand ? t('common.hide') : t('common.viewAll')}
          </Button>
        </div>
        <KiwiCollapse in={isExpand}>
          {list.length > 0 && <div className={styles.listDomain}>{renderListDomain()}</div>}
          <div className={styles.buttonWrapper}>{buttonElement}</div>
        </KiwiCollapse>
      </div>
    );
  }

  return (
    <Styled.Container>
      <Styled.Group>
        <Styled.Title>{title}</Styled.Title>
        <Styled.ButtonHide onClick={() => setIsExpand((prevState) => !prevState)}>
          <Styled.ButtonText>{isExpand ? t('common.hide') : t('common.viewAll')}</Styled.ButtonText>
          <Icomoon className={isExpand ? 'arrow-up' : 'arrow-down-alt'} color={Colors.SECONDARY_50} size={14} />
        </Styled.ButtonHide>
      </Styled.Group>
      <Collapse isExpand={isExpand}>
        <Styled.Wrapper>
          <Styled.List>
            {list.length > 0 && renderList()}
          </Styled.List>
        </Styled.Wrapper>

        <Styled.ButtonWrapper>
          {buttonElement}
        </Styled.ButtonWrapper>
      </Collapse>
    </Styled.Container>
  );
};

SettingExpandList.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  buttonElement: PropTypes.element,
  isExpandList: PropTypes.bool,
};

SettingExpandList.defaultProps = {
  title: '',
  list: [],
  canEdit: false,
  canDelete: false,
  onEdit: () => {},
  onDelete: () => {},
  buttonElement: null,
  isExpandList: false,
};

export default SettingExpandList;

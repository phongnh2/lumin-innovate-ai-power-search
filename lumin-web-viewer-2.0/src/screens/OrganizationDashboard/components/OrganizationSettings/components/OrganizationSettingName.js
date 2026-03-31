/* eslint-disable react/jsx-no-bind */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import CircularLoading from 'luminComponents/CircularLoading';
import Icomoon from 'luminComponents/Icomoon';
import Input from 'luminComponents/Shared/Input';
import Tooltip from 'luminComponents/Shared/Tooltip';

import { useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { organizationServices } from 'services';

import { toastUtils, validator } from 'utils';

import { ModalTypes } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

OrganizationSettingName.defaultProps = {
  onError: PropTypes.func,
};

OrganizationSettingName.propTypes = {
  onError: () => {},
};

function OrganizationSettingName(props) {
  const { onError } = props;
  const [organization] = useSelector((state) => [selectors.getCurrentOrganization(state)]);
  const { name, domain, _id } = organization.data || {};
  const defaultName = name || domain || '';
  const [isDisabled, setIsDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState(defaultName);
  const inputRef = useRef(null);
  const { t } = useTranslation();

  const { onKeyDown } = useKeyboardAccessibility();

  const isTheSameOrgName = name === newName.trim();
  const shouldDisabledUpdate = isTheSameOrgName || isSaving || Boolean(error);

  useEffect(() => {
    setNewName(defaultName);
  }, [defaultName]);

  useEffect(() => {
    if (isDisabled) {
      inputRef?.current.blur();
      unstable_batchedUpdates(() => {
        setNewName(defaultName);
        setError('');
      });
      onError('');
    }
  }, [isDisabled, defaultName, onError]);

  useEffect(() => {
    if (!isDisabled) {
      inputRef?.current.focus();
    }
  }, [isDisabled]);

  function handleChangeName(e) {
    const currentName = e.target.value || '';
    const nameTrimmed = currentName.trim();
    const validateOrgName = validator.validateOrgName(nameTrimmed);
    unstable_batchedUpdates(() => {
      setNewName(currentName);
      setError(validateOrgName);
    });
  }

  function handleCancel() {
    setIsDisabled(true);
  }

  async function handleOnSave() {
    try {
      setIsSaving(true);
      onError('');
      await organizationServices.changeProfileOrganization({
        orgId: _id,
        profile: { name: newName.trim() },
      });
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('common.updateSuccessfully'),
      });
      setIsDisabled(true);
    } catch (error) {
      onError(t('orgSettings.updateOrgNameFailed'));
    } finally {
      setIsSaving(false);
    }
  }

  function openEditableInput() {
    setIsDisabled(false);
  }

  return (
    <div className="OrganizationSettings__inputWrapper">
      <div className="OrganizationSettings__inputTitleContainer">
        <div className="OrganizationSettings__nameWrapper">
          <h3 className="OrganizationSettings__sub-title">{t('common.orgName')}</h3>
          <Tooltip
            tooltipStyle={{
              fontSize: 12,
            }}
            title={t('orgSettings.tooltipUpdateOrgName')}
            placement="right"
          >
            <Icomoon style={{ marginLeft: '5px' }} className="info" size={16} color={Colors.SECONDARY} />
          </Tooltip>
        </div>
      </div>
      <div className="OrganizationSettings__inputContainer">
        <Input
          // eslint-disable-next-line react/jsx-no-bind
          onChange={handleChangeName}
          value={isDisabled ? defaultName : newName}
          placeholder={t('common.eg', { egText: 'Lisa B' })}
          disabled={isDisabled}
          errorMessage={error}
          showClearButton
          hideValidationIcon
          ref={inputRef}
          style={{
            width: 454,
          }}
        />
        {isDisabled && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <span
            role="button"
            tabIndex={0}
            className="OrganizationSettings__changeOrgName"
            onClick={openEditableInput}
            onKeyDown={onKeyDown}
          >
            {t('common.changeName')}
          </span>
        )}
      </div>
      {!isDisabled && (
        <div className="OrganizationSettings__btnContainer">
          <ButtonMaterial size={ButtonSize.XL} color={ButtonColor.TERTIARY} onClick={handleCancel} disabled={isSaving}>
            {t('common.cancel')}
          </ButtonMaterial>
          <ButtonMaterial size={ButtonSize.XL} onClick={handleOnSave} disabled={shouldDisabledUpdate}>
            {isSaving && <CircularLoading color="inherit" size={20} style={{ marginRight: 10 }} />}
            {t('common.update')}
          </ButtonMaterial>
        </div>
      )}
    </div>
  );
}

export default OrganizationSettingName;

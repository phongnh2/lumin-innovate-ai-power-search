import { Divider, Menu, MenuItemSize, Text } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { leftSideBarSelectors } from '@new-ui/components/LuminLeftSideBar/slices';

import actions from 'actions';
import selectors from 'selectors';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';
import useToolProperties from 'luminComponents/GeneralLayout/hooks/useToolProperties';
import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { useTranslation } from 'hooks';
import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useIsValidDocumentForFormFieldDetection } from 'features/FormFieldDetection/hooks/useIsValidDocumentForFormFieldDetection';
import { useProcessFormFieldDetection } from 'features/FormFieldDetection/hooks/useProcessFormFieldDetection';
import useShowModal from 'features/FormFieldDetection/hooks/useShowModal';
import { readAloudActions, readAloudSelectors } from 'features/ReadAloud/slices';

import { DataElements } from 'constants/dataElement';

import { FORM_BUILDER_TOOL_ITEM } from './constants';
import FormBuilderCustomizeItem from './FormBuilderCustomizeItem';
import FormBuilderFormFieldDetectionItem from './FormBuilderFormFieldDetectionItem';
import { FormBuilderToolProps, IToolPopperRenderParams } from './interfaces';
import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

import styles from './FormBuilderTool.module.scss';

const FormBuilderTool = (props: FormBuilderToolProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { showFormFieldDetectionMenuItem, specificTool } = props;
  const [formBuilderPopperOpen, setFormBuilderPopperOpen] = useState(false);
  const [shouldCloseOnClickOutside, setShouldCloseOnClickOutside] = useState(true);
  const isOffline = useSelector(selectors.isOffline);
  const isLeftSidebarPopoverOpened = useSelector(leftSideBarSelectors.isLeftSidebarPopoverOpened);
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);

  const toolbarContext = useToolbarContext();
  const { collapsibleOrder, renderAsMenuItem, onChangeNavigationTab } = useContext(ToolbarItemContext);
  const { toggleFormBuildTool } = useToolProperties();
  const { withEditPermission, requestAccessModalElement } = useRequestPermissionChecker({
    permissionRequest: RequestType.EDITOR,
  });
  const formBuilderButtonRef = useRef<HTMLButtonElement>(null);
  const { showPreconditionNotMatchModal } = useShowModal();
  const { isValidDocumentForFormFieldDetection } = useIsValidDocumentForFormFieldDetection();
  const applyFormFieldDetection = useProcessFormFieldDetection();

  const handleCheckPermission = (
    { toggleCheckPopper, shouldShowPremiumIcon }: IToolPopperRenderParams,
    openToolCallback: () => void
  ) => {
    if (shouldShowPremiumIcon) {
      setShouldCloseOnClickOutside(false);
      toggleCheckPopper();
      return;
    }

    if (renderAsMenuItem) {
      dispatch(actions.closeElement(DataElements.TOOLBAR_POPOVER));
    }
    if (isLeftSidebarPopoverOpened) {
      onChangeNavigationTab();
    }
    setFormBuilderPopperOpen(false);
    withEditPermission(openToolCallback)();
  };

  const cleanup = useCallback(() => {
    setShouldCloseOnClickOutside(true);
    setFormBuilderPopperOpen((prevState) => !prevState);
  }, []);

  const handleClickMenuItem = async (renderParams: IToolPopperRenderParams, openToolCallback: () => void) => {
    if (isInReadAloudMode) {
      dispatch(readAloudActions.setIsInReadAloudMode(false));
    }

    const hasSwitchedTab = onChangeNavigationTab?.();
    if (!hasSwitchedTab) {
      return;
    }
    await ToolSwitchableChecker.createToolSwitchableHandler(() => {
      if (renderParams.withToolbarPopover) {
        withEditPermission(toggleFormBuildTool, renderParams.toggleCheckPopper());
      } else {
        handleCheckPermission(renderParams, openToolCallback);
      }
    })();
  };

  const handleClickAIAutoDetect = () => {
    setFormBuilderPopperOpen(false);
    if (!isValidDocumentForFormFieldDetection) {
      showPreconditionNotMatchModal();
    } else {
      applyFormFieldDetection().catch(() => {});
    }
  };

  const renderCustomizeFormBuilderItem = () => (
    <FormBuilderCustomizeItem
      onCleanUp={cleanup}
      onClick={(renderParams: IToolPopperRenderParams) => handleClickMenuItem(renderParams, toggleFormBuildTool)}
      isInToolbarPopover={renderAsMenuItem}
    />
  );

  const renderAutoDetectFormBuilderItem = () =>
    showFormFieldDetectionMenuItem ? (
      <FormBuilderFormFieldDetectionItem
        onCleanUp={cleanup}
        onClick={(renderParams: IToolPopperRenderParams) => handleClickMenuItem(renderParams, handleClickAIAutoDetect)}
      />
    ) : null;

  if (specificTool === FORM_BUILDER_TOOL_ITEM.CUSTOMIZE) {
    return renderCustomizeFormBuilderItem();
  }

  if (specificTool === FORM_BUILDER_TOOL_ITEM.AUTO_DETECT) {
    return renderAutoDetectFormBuilderItem();
  }

  if (renderAsMenuItem) {
    return (
      <div className={styles.popoverWrapper}>
        <Divider />
        <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)" className={styles.title}>
          {t('generalLayout.toolProperties.formBuilder')}
        </Text>
        {renderCustomizeFormBuilderItem()}
        {renderAutoDetectFormBuilderItem()}
      </div>
    );
  }

  return (
    <>
      <Menu
        data-cy="form_builder_menu"
        opened={formBuilderPopperOpen}
        itemSize={MenuItemSize.dense}
        onChange={setFormBuilderPopperOpen}
        disabled={isOffline}
        closeOnItemClick={false}
        styles={{
          dropdown: {
            minWidth: 266,
          },
        }}
        closeOnClickOutside={shouldCloseOnClickOutside}
        ComponentTarget={
          <SingleButton
            ref={formBuilderButtonRef}
            icon="md_fillable_form"
            iconSize={24}
            dataElement="formBuilderButton"
            data-lumin-btn-name={ButtonName.FORM_BUILDER}
            tooltipData={{ location: 'bottom', title: formBuilderPopperOpen ? '' : t('annotation.formBuilder') }}
            label={t('annotation.formBuilder')}
            hideLabelOnSmallScreen={toolbarContext.collapsedItem > collapsibleOrder}
            isActive={formBuilderPopperOpen}
            disabled={isOffline}
            showArrow
          />
        }
      >
        {renderCustomizeFormBuilderItem()}
        {renderAutoDetectFormBuilderItem()}
      </Menu>
      {requestAccessModalElement}
    </>
  );
};

export default FormBuilderTool;

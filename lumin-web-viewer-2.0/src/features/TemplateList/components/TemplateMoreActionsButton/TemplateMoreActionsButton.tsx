import { FileMagnifyingGlassIcon } from '@luminpdf/icons/dist/csr/FileMagnifyingGlass';
import { FileTextIcon } from '@luminpdf/icons/dist/csr/FileText';
import { LinkSimpleIcon } from '@luminpdf/icons/dist/csr/LinkSimple';
import { NotePencilIcon } from '@luminpdf/icons/dist/csr/NotePencil';
import { IconButton, Divider, MenuItem, MenuItemProps, Icomoon, IconSize } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import { ScrollableMenu } from 'luminComponents/ReskinLayout/components/ScrollableMenu';

import withDocumentItemAuthorization from 'HOC/withDocumentItemAuthorization';

import { useDesktopMatch, useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { TemplateActionsType } from 'features/TemplateList/types';

import { DocumentTemplateActions } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';

import styles from './TemplateMoreActionsButton.module.scss';

type MenuOptionsMappingValueType = {
  title: string;
  icon: MenuItemProps['leftIconProps'];
  clickAction: (...args: unknown[]) => void;
  precheckingRequired?: boolean;
  expiredBlocking?: boolean;
  disabledFeature?: boolean;
  tooltip?: string;
  switchButton?: {
    display: boolean;
    checked: boolean;
    disabled?: boolean;
  };
  btnName?: typeof ButtonName[keyof typeof ButtonName];
};

type TemplateMoreActionsButtonProps = {
  document: IDocumentBase;
  containerScrollRef: React.MutableRefObject<HTMLElement>;
  withAuthorize: (action: string) => boolean;
  onToggle?: (value: boolean) => void;
  actions: TemplateActionsType;
};

const TemplateMoreActionsButton = (props: TemplateMoreActionsButtonProps) => {
  const { withAuthorize, actions, containerScrollRef, onToggle } = props;
  const [openedMenu, setOpenedMenu] = useState(false);

  const { t } = useTranslation();
  const isDesktopMatch = useDesktopMatch();

  const menuOptionsMapping = {
    [DocumentTemplateActions.PreviewTemplate]: {
      title: t('common.preview'),
      icon: <FileMagnifyingGlassIcon width={20} height={20} color="var(--kiwi-colors-surface-on-surface)" />,
      clickAction: actions.previewTemplate,
    },
    [DocumentTemplateActions.CopyLinkTemplate]: {
      title: t('templatePage.copyLink'),
      icon: <LinkSimpleIcon width={20} height={20} color="var(--kiwi-colors-surface-on-surface)" />,
      clickAction: actions.copyLinkTemplate,
    },
    [DocumentTemplateActions.UseTemplate]: {
      title: t('common.use'),
      icon: <FileTextIcon width={20} height={20} color="var(--kiwi-colors-surface-on-surface)" />,
      clickAction: actions.useTemplate,
    },
    [DocumentTemplateActions.EditTemplate]: {
      title: t('common.edit'),
      icon: <NotePencilIcon width={20} height={20} color="var(--kiwi-colors-surface-on-surface)" />,
      clickAction: actions.editTemplate,
    },
    [DocumentTemplateActions.DeleteTemplate]: {
      title: t('common.delete'),
      icon: <Icomoon size={IconSize.md} type="trash-md" color="var(--kiwi-colors-surface-on-surface)" />,
      clickAction: actions.deleteTemplate,
    },
  };

  const withClosePopper = (callback: (...args: unknown[]) => void) => {
    if (typeof callback !== 'function') {
      return;
    }
    callback();
    setOpenedMenu(false);
    onToggle?.(false);
  };

  const onItemClick = (item: MenuOptionsMappingValueType) => {
    withClosePopper((...rest) => {
      item.clickAction(...rest);
    });
  };

  const renderMenuItem = (documentAction: string) => {
    const item = menuOptionsMapping[documentAction];
    const { title, icon } = item;
    const onClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      onItemClick(item);
    };

    return (
      withAuthorize(documentAction) &&
      item && (
        <MenuItem leftSection={icon} onClick={onClick}>
          {title}
        </MenuItem>
      )
    );
  };

  return (
    <ScrollableMenu
      ComponentTarget={
        <IconButton
          data-cy="more_actions_button"
          icon="dots-vertical-md"
          size="md"
          activated={openedMenu}
          {...(!isDesktopMatch && { iconColor: 'var(--kiwi-colors-surface-on-surface-variant)' })}
          onClick={(event) => event.stopPropagation()}
        />
      }
      opened={openedMenu}
      onChange={(value) => {
        setOpenedMenu(value);
        onToggle?.(value);
      }}
      position="bottom-end"
      closeOnScroll={{ elementRef: containerScrollRef }}
      classNames={{
        dropdown: styles.dropdown,
      }}
    >
      {renderMenuItem(DocumentTemplateActions.PreviewTemplate)}
      {renderMenuItem(DocumentTemplateActions.CopyLinkTemplate)}
      {renderMenuItem(DocumentTemplateActions.UseTemplate)}
      {renderMenuItem(DocumentTemplateActions.EditTemplate)}
      {withAuthorize(DocumentTemplateActions.DeleteTemplate) && (
        <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
      )}
      {renderMenuItem(DocumentTemplateActions.DeleteTemplate)}
    </ScrollableMenu>
  );
};

export default withDocumentItemAuthorization(TemplateMoreActionsButton);

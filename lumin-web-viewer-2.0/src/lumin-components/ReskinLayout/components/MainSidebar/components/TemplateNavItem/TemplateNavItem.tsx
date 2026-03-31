import classNames from 'classnames';
import { IconButton, PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { usePersonalWorkspaceLocation, useRestrictedUser, useTranslation } from 'hooks';

import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import NewBadge from 'features/PromoteTemplates/components/NewBadge';
import PromoteTemplatesPopover from 'features/PromoteTemplates/components/PromoteTemplatesPopover';
import usePromoteTemplates from 'features/PromoteTemplates/hooks/usePromoteTemplates';

import { AWS_EVENTS } from 'constants/awsEvents';
import { STATIC_PAGE_URL } from 'constants/urls';

import styles from '../../MainSidebar.module.scss';

type Props = {
  orgLink?: string;
};

const TemplateNavItem = ({ orgLink }: Props) => {
  const { t } = useTranslation();

  const { hasNotVisitedTemplateList, setVisited, isOpenPopover, onClickLater, setIsHoveringPopover, onClickTryItNow } =
    usePromoteTemplates();

  const isAtPersonalWorkspace = usePersonalWorkspaceLocation();

  const { templateManagementEnabled } = useRestrictedUser();

  const renderTemplates = (isActive: boolean) => (
    <PlainTooltip disabled={templateManagementEnabled} content={t('featureRestricted.disabledMessage')} maw={186}>
      <div
        className={classNames(styles.navigationContainer, {
          [styles.activeTemplates]: isActive,
        })}
        data-disabled={!templateManagementEnabled}
      >
        <div className={styles.iconButtonContainer}>
          <PromoteTemplatesPopover
            isOpen={isOpenPopover}
            onClickLater={onClickLater}
            onClickTryItNow={onClickTryItNow}
            setIsHovering={setIsHoveringPopover}
          >
            <div style={{ position: 'relative' }}>
              <IconButton
                icon="logo-template-lg"
                size="lg"
                disabled={!templateManagementEnabled}
                activatedProps={{ bg: 'var(--kiwi-colors-core-primary-container' }}
                activated={isActive}
                data-cy="navigation_templates"
                data-lumin-btn-name={NavigationNames.TEMPLATES}
                data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
              />
              {hasNotVisitedTemplateList && (
                <div className={styles.redDotContainer}>
                  <NewBadge />
                </div>
              )}
            </div>
          </PromoteTemplatesPopover>
        </div>
        <Text size="sm" type="label" className={styles.label}>
          {t('common.templates')}
        </Text>
      </div>
    </PlainTooltip>
  );

  const renderTemplateNavLink = () => {
    const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!templateManagementEnabled) {
        e.preventDefault();
        return;
      }
      setVisited();
    };
    const disableLinkProps = {
      className: styles.disabled,
      onClick,
      onMouseDown: onClick,
      onContextMenu: onClick,
    };
    return (
      <NavLink {...(!templateManagementEnabled && disableLinkProps)} tabIndex={-1} to={`${orgLink}/templates`}>
        {({ isActive }) => renderTemplates(isActive)}
      </NavLink>
    );
  };

  return isAtPersonalWorkspace ? (
    <div onClick={() => window.open(`${STATIC_PAGE_URL}/form-templates`)} role="button" tabIndex={-1}>
      {renderTemplates(false)}
    </div>
  ) : (
    renderTemplateNavLink()
  );
};

export default TemplateNavItem;

import classNames from "classnames";
import { IconButton, PlainTooltip, Text } from "lumin-ui/kiwi-ui";
import React from "react";
import { NavLink, useParams } from "react-router-dom";

import { usePersonalWorkspaceLocation, useRestrictedUser, useTranslation } from "hooks";

import { NavigationNames } from "utils/Factory/EventCollection/constants/NavigationEvent";

import { AWS_EVENTS } from "constants/awsEvents";
import { STATIC_PAGE_URL } from "constants/urls";

import styles from "../../MainSidebar.module.scss";

type Props = {
  orgLink?: string;
};

const WEBOPT_PATH = "webopt";

const SignAndTemplate = ({ orgLink }: Props) => {
  const { t } = useTranslation();
  const { "*": otherParams } = useParams();

  const isAtPersonalWorkspace = usePersonalWorkspaceLocation();

  const { templateManagementEnabled } = useRestrictedUser();

  const renderTemplates = (isActive: boolean) => (
    <PlainTooltip disabled={templateManagementEnabled} content={t("featureRestricted.disabledMessage")} maw={186}>
      <div
        className={classNames(styles.navigationContainer, {
          [styles.activeTemplates]: isActive,
        })}
        data-disabled={!templateManagementEnabled}
      >
        <div className={styles.iconButtonContainer}>
          <IconButton
            icon="logo-template-lg"
            size="lg"
            disabled={!templateManagementEnabled}
            activatedProps={{ bg: "var(--kiwi-colors-core-primary-container" }}
            activated={isActive}
            data-cy="navigation_templates"
            data-lumin-btn-name={NavigationNames.TEMPLATES}
            data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
          />
        </div>
        <Text size="sm" type="label" className={styles.label}>
          {t("common.templates")}
        </Text>
      </div>
    </PlainTooltip>
  );

  const renderTemplateNavLink = () => {
    const disableLinkProps = {
      className: styles.disabled,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
      onMouseDown: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
      onContextMenu: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
    };
    return (
      <NavLink {...(!templateManagementEnabled && disableLinkProps)} tabIndex={-1} to={`${orgLink}/templates`}>
        {({ isActive }) => renderTemplates(isActive)}
      </NavLink>
    );
  };

  const renderDiscoverLink = () => {
    const link = `${orgLink}/webopt`;
    const isActive = otherParams?.includes(WEBOPT_PATH);

    return (
      <NavLink tabIndex={-1} to={link}>
        <div
          data-active={isActive}
          className={classNames(styles.navigationContainer, isActive ? styles.activeEdit : undefined)}
        >
          <div className={styles.iconButtonContainer}>
            <IconButton
              icon="ph-globe"
              size="lg"
              activatedProps={{ bg: "var(--kiwi-colors-core-primary-container" }}
              activated={isActive}
              data-cy="navigation_discover"
            />
          </div>
          <Text size="sm" type="label">
            Discover
          </Text>
        </div>
      </NavLink>
    );
  };

  return (
    <>
      {!isAtPersonalWorkspace && (
        <NavLink tabIndex={-1} to={`${orgLink}/sign`}>
          {({ isActive }) => (
            <div
              data-active={isActive}
              className={classNames(styles.navigationContainer, isActive ? styles.activeEdit : undefined)}
            >
              <div className={styles.iconButtonContainer}>
                <IconButton
                  icon="logo-sign-lg"
                  size="lg"
                  activatedProps={{
                    bg: "var(--kiwi-colors-core-tertiary-container)",
                    color: "var(--kiwi-colors-core-on-tertiary-container)",
                  }}
                  activated={isActive}
                  data-cy="navigation_sign"
                  data-lumin-btn-name={NavigationNames.CONTRACTS}
                  data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
                />
              </div>
              <Text size="sm" type="label">
                {t("action.sign")}
              </Text>
            </div>
          )}
        </NavLink>
      )}
      {isAtPersonalWorkspace ? (
        <div onClick={() => window.open(`${STATIC_PAGE_URL}/form-templates`)} role="button" tabIndex={-1}>
          {renderTemplates(false)}
        </div>
      ) : (
        renderTemplateNavLink()
      )}
      {renderDiscoverLink()}
    </>
  );
};

export default SignAndTemplate;

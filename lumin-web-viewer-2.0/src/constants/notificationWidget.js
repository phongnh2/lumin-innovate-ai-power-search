import dayjs from 'dayjs';

import DownloadLuminAppImage from 'assets/images/widget/download_app_widget.png';
import DownloadPwaImage from 'assets/images/widget/download_pwa_widget.png';
import DownloadPwaImageDark from 'assets/images/widget/download_pwa_widget_dark.png';
import UpgradeProfessionalWidget from 'assets/images/widget/upgrade_professional_widget.png';
import UpgradeProfessionalWidgetDark from 'assets/images/widget/upgrade_professional_widget_dark.png';

import { getTranslatedWidgetContent, getSubActionTitle } from 'helpers/getTranslatedWidgetContent';

import { MessageName, MessagePurpose, SubEventData } from 'utils/Factory/EventCollection/MessageEventCollection';

import { THEME_MODE } from './lumin-common';
import { NOTIFICATION_WIDGET_TYPE } from './notificationWidgetType';

export const MEDIA_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video',
};

export const WIDGET_PROPERTIES = {
  TITLE: 'title',
  DESCRIPTION: 'description',
  ACTION: 'action',
};

export const WIDGET_TYPES_NEED_PLAN_TO_SHOW = [NOTIFICATION_WIDGET_TYPE.EDIT_PDF];

export function mapWidget(translator, theme) {
  const getWidgetTitleByType = (widgetType, isSubContent = false) =>
    getTranslatedWidgetContent(widgetType, WIDGET_PROPERTIES.TITLE, translator, isSubContent);

  const getWidgetDescriptionByType = (widgetType, isSubContent = false) =>
    getTranslatedWidgetContent(widgetType, WIDGET_PROPERTIES.DESCRIPTION, translator, isSubContent);

  const getWidgetActionByType = (widgetType, isSubContent = false) =>
    getTranslatedWidgetContent(widgetType, WIDGET_PROPERTIES.ACTION, translator, isSubContent);

  const getSubTitle = (widgetType) => getSubActionTitle(widgetType, translator);

  return {
    DOWNLOAD_PWA: {
      type: NOTIFICATION_WIDGET_TYPE.DOWNLOAD_PWA,
      title: getWidgetTitleByType(NOTIFICATION_WIDGET_TYPE.DOWNLOAD_PWA),
      description: getWidgetDescriptionByType(NOTIFICATION_WIDGET_TYPE.DOWNLOAD_PWA),
      action: getWidgetActionByType(NOTIFICATION_WIDGET_TYPE.DOWNLOAD_PWA),
      icon: theme === THEME_MODE.LIGHT ? DownloadPwaImage : DownloadPwaImageDark,
      showAction: true,
      messageEventData: {
        messageName: MessageName.DOWNLOAD_PWA_APP,
        messagePurpose: MessagePurpose[MessageName.DOWNLOAD_PWA_APP],
      },
      isAutoClosePreview: true,
    },
    DOWNLOAD_MOBILE_APP: {
      type: NOTIFICATION_WIDGET_TYPE.DOWNLOAD_MOBILE_APP,
      title: getWidgetTitleByType(NOTIFICATION_WIDGET_TYPE.DOWNLOAD_MOBILE_APP),
      description: getWidgetDescriptionByType(NOTIFICATION_WIDGET_TYPE.DOWNLOAD_MOBILE_APP),
      action: getWidgetActionByType(NOTIFICATION_WIDGET_TYPE.DOWNLOAD_MOBILE_APP),
      subAction: {
        title: getSubTitle(NOTIFICATION_WIDGET_TYPE.DOWNLOAD_MOBILE_APP),
        subEventData: SubEventData[NOTIFICATION_WIDGET_TYPE.DOWNLOAD_MOBILE_APP],
      },
      icon: '',
      showAction: true,
      media: { src: DownloadLuminAppImage, type: MEDIA_TYPE.IMAGE },
      isAutoClosePreview: false,
      messageEventData: {
        messageName: MessageName.DOWNLOAD_MOBILE_APP,
        messagePurpose: MessagePurpose[MessageName.DOWNLOAD_MOBILE_APP],
      },
    },
    UPGRADE_PROFESSIONAL: {
      type: NOTIFICATION_WIDGET_TYPE.UPGRADE_PROFESSIONAL,
      title: getWidgetTitleByType(NOTIFICATION_WIDGET_TYPE.UPGRADE_PROFESSIONAL),
      description: getWidgetDescriptionByType(NOTIFICATION_WIDGET_TYPE.UPGRADE_PROFESSIONAL),
      action: getWidgetActionByType(NOTIFICATION_WIDGET_TYPE.UPGRADE_PROFESSIONAL),
      icon: theme === THEME_MODE.LIGHT ? UpgradeProfessionalWidget : UpgradeProfessionalWidgetDark,
      isGradientBackground: true,
      showAction: true,
      messageEventData: {
        messageName: MessageName.PROMPT_UPGRADE_TO_PROF,
        messagePurpose: MessagePurpose[MessageName.PROMPT_UPGRADE_TO_PROF],
      },
      isAutoClosePreview: true,
    },
  };
}

export const WidgetTimer = {
  NOTIFY_NEW_NOTIFICATION: 6000,
  STOP_NOTIFY_NEW_NOTIFICATION: 10000,
  CREATE_WIDGET: {
    DOWNLOAD_PWA: 3 * 60 * 1000, // 3 minutes
    DOWNLOAD_MOBILE_APP: 6 * 60 * 1000, // 6 minutes
    DEFAULT: 1000,
  },
  UPDATE_PREVIEW_ITEM: 500,
  DEFAULT: 1000,
};

export const PreviewState = {
  view: 'view',
  close: 'close',
};

export const FeatureWidgetReleased = {
  [NOTIFICATION_WIDGET_TYPE.DOWNLOAD_MOBILE_APP]: '2023-09-07',
};

export const PIN_ON_TOP_WIDGET = {
  type: NOTIFICATION_WIDGET_TYPE.DOWNLOAD_MOBILE_APP,
  expirationDate: dayjs(FeatureWidgetReleased[NOTIFICATION_WIDGET_TYPE.DOWNLOAD_MOBILE_APP]).add(3, 'month'),
};

export const WIDGET_DIRECTIONS = {
  MOBILE_APP: 'https://www.luminpdf.com/download/#mobile',
  WEB_APP: 'https://www.luminpdf.com/download/#desktop',
  DISCOVER_NEW_PLANS: 'https://www.luminpdf.com/discover-new-plans?user=professional',
  PLANS_PAGE: `https://luminpdf.com/pricing`,
  DOWNLOAD_APP_VIA_APP_STORE: 'https://apps.apple.com/us/app/lumin-pdf/id1367372862',
  DOWNLOAD_APP_VIA_PLAY_STORE: 'https://play.google.com/store/apps/details?id=com.luminpdfapp',
};

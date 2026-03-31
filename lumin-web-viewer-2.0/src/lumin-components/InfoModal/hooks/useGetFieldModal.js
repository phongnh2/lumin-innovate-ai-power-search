import { Avatar, Icomoon as KiwiIcomoon, PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';
import DefaultTeamAvatar from 'assets/reskin/lumin-svgs/default-team-avatar.png';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import SvgElement from 'lumin-components/SvgElement';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import { useTabletMatch, useHandleErrorTemplate, useTranslation, useEnableWebReskin, useGetCurrentOrganization, useGetCurrentTeam } from 'hooks';

import {
  documentServices, FolderServices, templateServices,
} from 'services';

import logger from 'helpers/logger';

import { dateUtil, bytesToSize, file, avatar } from 'utils';
import mime from 'utils/mime-types';

import { documentStorage } from 'constants/documentConstants';
import { LocationType } from 'constants/locationConstant';
import { INFO_MODAL_TYPE, TOOLTIP_MAX_WIDTH, TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import * as Styled from '../InfoModal.styled';

const getFieldName = (t) => ({
  FILE_NAME: t('modal.fileName'),
  FILE_TYPE: t('modal.fileType'),
  FILE_SIZE: t('modal.fileSize'),
  LOCATION: t('modal.location'),
  CREATOR: t('modal.creator'),
  CREATION_DATE: t('modal.creationDate'),
  MODIFICATION_DATE: t('modal.modificationDate'),
  STORAGE: t('modal.storage'),
  FOLDER_NAME: t('modal.folderName'),
  NUMBER_OF_DOC: t('modal.numberOfDoc'),
  NUMBER_OF_VIEW: t('modal.numberOfView'),
  NUMBER_OF_DOWNLOAD: t('modal.numberOfDownload'),
});

export const useGetFieldModal = ({
  modalType, currentTarget, onErrorCallback,
}) => {
  const currentOrganization = useGetCurrentOrganization();
  const orgTeams = useSelector(selectors.getTeams, shallowEqual) || [];
  const currentTeam = useGetCurrentTeam();
  const { isEnableReskin } = useEnableWebReskin();
  const { t } = useTranslation();
  const isTabletUp = useTabletMatch();
  const [modalFields, setModalFields] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const targetId = currentTarget._id;
  const [error, setError] = useState('');
  const fieldName = getFieldName(t);

  useEffect(() => {
    // eslint-disable-next-line no-use-before-define
    getData();
  }, []);

  useHandleErrorTemplate({ error, onConfirm: onErrorCallback });

  const getStorage = (storage, isReskin) => {
    // eslint-disable-next-line no-magic-numbers
    const svgSize = isReskin ? 24 : 18;
    return storage === documentStorage.s3 ? (
      <SvgElement content="new-lumin-logo" height={svgSize} />
    ) : (
      <SvgElement content={storage || 'google'} width={svgSize} height={svgSize} isReskin={isReskin} />
    );
  };

  const getLocationItem = ({ icon, text }) => (
    <Styled.Location>
      <Icomoon className={icon} size={isTabletUp ? 18 : 16} color={Colors.SECONDARY_50} />
      <Styled.FieldDesc>{text}</Styled.FieldDesc>
    </Styled.Location>
  );

  const getLocation = ({ belongsTo, folderName, breadcrumbs } = {}) => {
    const { type, location } = belongsTo || {};
    const breadcrumbsLength = breadcrumbs?.length || 0;

    if (isEnableReskin && modalType === INFO_MODAL_TYPE.DOCUMENT) {
      if (folderName) {
        return (
          <Styled.LocationReskin>
            <KiwiIcomoon type="folder-shape-md" color="var(--kiwi-colors-add-on-on-primary-fixed-variant)" size="md" />
            <PlainTooltip content={folderName} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY}>
              <Text type="body" size="md" ellipsis>
                {folderName}
              </Text>
            </PlainTooltip>
          </Styled.LocationReskin>
        );
      }
      switch (type) {
        case LocationType.ORGANIZATION_TEAM: {
          const team = orgTeams.find((team) => team._id === location._id) || {};
          return (
            <Styled.LocationReskin>
              <Avatar
                src={avatar.getAvatar(team.avatarRemoteId) || DefaultTeamAvatar}
                placeholder={DefaultTeamAvatar}
                size="xs"
                variant="outline"
                alt="Team Avatar"
              />
              <PlainTooltip content={location.name} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY}>
                <Text type="body" size="md" ellipsis>
                  {location.name}
                </Text>
              </PlainTooltip>
            </Styled.LocationReskin>
          );
        }
        case LocationType.ORGANIZATION:
          return (
            <Styled.LocationReskin>
              <Avatar
                src={avatar.getAvatar(currentOrganization?.avatarRemoteId) || DefaultOrgAvatar}
                placeholder={DefaultOrgAvatar}
                size="xs"
                variant="outline"
                alt="Workspace Avatar"
              />
              <PlainTooltip content={`All ${location.name}`} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY}>
                <Text type="body" size="md" ellipsis>
                  All {location.name}
                </Text>
              </PlainTooltip>
            </Styled.LocationReskin>
          );
        case LocationType.PERSONAL:
          return t('sidebar.myDocuments');
        default:
          break;
      }
    }

    if (isEnableReskin && modalType === INFO_MODAL_TYPE.FOLDER) {
      if (breadcrumbsLength) {
        const lastItemName = breadcrumbs[breadcrumbsLength - 1].name;
        return (
          <Styled.LocationReskin>
            <KiwiIcomoon type="folder-shape-md" color="var(--kiwi-colors-add-on-on-primary-fixed-variant)" size="md" />
            <PlainTooltip content={lastItemName} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY}>
              <Text type="body" size="md" ellipsis>
                {lastItemName}
              </Text>
            </PlainTooltip>
          </Styled.LocationReskin>
        );
      }
      if (type === LocationType.PERSONAL) {
        const label = t('pageTitle.myDocuments');
        return (
          <PlainTooltip content={label} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY}>
            <Text type="body" size="md">
              {label}
            </Text>
          </PlainTooltip>
        );
      }
      const getAvatar = () => {
        if (type === LocationType.ORGANIZATION_TEAM) {
          return avatar.getAvatar(currentTeam.avatarRemoteId) || DefaultTeamAvatar;
        }
        return avatar.getAvatar(currentOrganization?.avatarRemoteId) || DefaultOrgAvatar;
      };
      return (
        <Styled.LocationReskin>
          <Avatar src={getAvatar()} size="xs" variant="outline" alt="Folder location" />
          <PlainTooltip content={location.name} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY}>
            <Text type="body" size="md" style={{ wordBreak: 'break-word' }}>
              {location.name}
            </Text>
          </PlainTooltip>
        </Styled.LocationReskin>
      );
    }

    if (folderName) {
      return getLocationItem({ icon: 'folder', text: folderName });
    }

    switch (type) {
      case LocationType.ORGANIZATION_TEAM:
        return getLocationItem({ icon: 'location-team', text: location.name });
      case LocationType.ORGANIZATION:
        return getLocationItem({ icon: 'location-org', text: location.name });
      case LocationType.PERSONAL:
        if (modalType === INFO_MODAL_TYPE.TEMPLATE) {
          return getLocationItem({ icon: 'location-template', text: location.name });
        } break;
      default:
        break;
    }
    return getLocationItem({ icon: 'user', text: t('common.documents') });
  };

  const getFieldsDocInfo = (docInfo) => {
    const { name, size, ownerName, mimeType, createdAt, lastModify, service, belongsTo, folderName, isShared } =
      docInfo;
    const pdfType = mime.extension(mimeType);

    return (
      {
        title: t('common.fileInfo'),
        data: [
          [
            {
              field: fieldName.FILE_NAME,
              value: file.getFilenameWithoutExtension(name),
            },
            {
              field: fieldName.FILE_TYPE,
              value: pdfType.toString().toUpperCase(),
            },
            {
              field: fieldName.FILE_SIZE,
              value: bytesToSize(size),
            },
          ],
          [
            !isShared && {
              field: fieldName.LOCATION,
              value: getLocation({ belongsTo, folderName }),
            },
            {
              field: fieldName.CREATOR,
              value: ownerName,
            },
            {
              field: fieldName.CREATION_DATE,
              value: dateUtil.formatMDYTime(new Date(createdAt * 1)),
            },
            {
              field: fieldName.MODIFICATION_DATE,
              value: dateUtil.formatMDYTime(new Date((lastModify || createdAt) * 1)),
            },
            isEnableReskin && {
              field: fieldName.STORAGE,
              value: getStorage(service, true),
            }
          ].filter(Boolean),
          !isEnableReskin &&
          [
            {
              field: fieldName.STORAGE,
              value: getStorage(service),
            },
          ],
        ].filter(Boolean),
      }
    );
  };

  const getFieldsFolderInfo = (folderInfo) => {
    const {
      name,
      createdAt,
      totalDocument,
      ownerName,
      belongsTo,
      breadcrumbs,
    } = folderInfo;

    return (
      {
        title: t('common.folderInfo'),
        data: [
          [
            {
              field: fieldName.FOLDER_NAME,
              value: name,
            },
          ],
          [
            {
              field: fieldName.LOCATION,
              value: getLocation({ belongsTo, breadcrumbs }),
            },
            {
              field: fieldName.CREATOR,
              value: ownerName,
            },
            {
              field: fieldName.CREATION_DATE,
              value: dateUtil.formatMDYTime(new Date(createdAt * 1)),
            },
            {
              field: isEnableReskin ? t('modal.docInside') : fieldName.NUMBER_OF_DOC,
              value: totalDocument,
            },
          ],
        ],
      }
    );
  };

  const getFieldsTemplateInfo = (templateInfo) => {
    const {
      name,
      counter,
      createdAt,
      ownerName,
      belongsTo,
    } = templateInfo;

    return (
      {
        title: t('common.templateInfo'),
        data: [
          [
            {
              field: fieldName.FILE_NAME,
              value: file.getFilenameWithoutExtension(name),
            },
          ],
          [
            {
              field: fieldName.LOCATION,
              value: getLocation({ belongsTo }),
            },
            {
              field: fieldName.CREATOR,
              value: ownerName,
            },
            {
              field: fieldName.CREATION_DATE,
              value: dateUtil.formatMDYTime(createdAt),
            },
          ],
          [
            {
              field: fieldName.NUMBER_OF_VIEW,
              value: counter?.view || 0,
            },
            {
              field: fieldName.NUMBER_OF_DOWNLOAD,
              value: counter?.download || 0,
            },
          ],
        ],
      }
    );
  };

  const getFolderInfo = (_folderId) => {
    const folderServices = new FolderServices();
    return folderServices.getDetail(_folderId);
  };

  const getServiceFetchInfo = async () => {
    switch (modalType) {
      case INFO_MODAL_TYPE.DOCUMENT:
        if (systemFileHandler.isSystemFile(targetId) || currentTarget) {
          return currentTarget;
        }
        return documentServices.getDocumentById(targetId);
      case INFO_MODAL_TYPE.FOLDER:
        return getFolderInfo(targetId);
      case INFO_MODAL_TYPE.TEMPLATE:
        return templateServices.getTemplateById(targetId);
      default:
        return null;
    }
  };

  const getFieldInfo = (targetInfo) => {
    switch (modalType) {
      case INFO_MODAL_TYPE.DOCUMENT:
        return getFieldsDocInfo(targetInfo);
      case INFO_MODAL_TYPE.FOLDER:
        return getFieldsFolderInfo(targetInfo);
      case INFO_MODAL_TYPE.TEMPLATE:
        return getFieldsTemplateInfo(targetInfo);
      default:
        return null;
    }
  };

  const getInfo = async () => {
    const targetInfo = await getServiceFetchInfo();
    if (modalType === INFO_MODAL_TYPE.DOCUMENT) {
      const { folderId, isShared } = targetInfo;

      if (isShared) {
        return getFieldInfo(targetInfo);
      }

      if (folderId) {
        const folderInfo = await getFolderInfo(folderId);
        return getFieldInfo({
          ...targetInfo,
          folderName: folderInfo.name,
        });
      }
    }

    return getFieldInfo(targetInfo);
  };

  const getData = async () => {
    setIsLoading(true);
    try {
      const info = await getInfo();
      setModalFields(info);
      setIsLoading(false);
    } catch (err) {
      setError(err);
      logger.logError({ error: err });
    }
  };

  return { modalFields, isLoading };
};

import { produce } from 'immer';
import { merge } from 'lodash';
import { useEffect, useState, useRef, useCallback } from 'react';
import { batch } from 'react-redux';
import { useMatch } from 'react-router-dom';

import { useCurrentTemplateList, useTranslation } from 'hooks';

import templateServices from 'services/templateServices';

import { toastUtils } from 'utils';
import templateEvent from 'utils/Factory/EventCollection/TemplateEventCollection';

import { ORG_PATH } from 'constants/organizationConstants';
import {
  PAGINATION_PAGE_SIZE,
  TEMPLATE_UPDATE_ACTIONS,
  TEMPLATE_TABS,
  MAPPING_TEMPLATE_TAB_TO_ORG_TEMPLATE_TABS,
  ORGANIZATION_TEMPLATE_TABS,
} from 'constants/templateConstant';

const useGetTemplates = ({ searchText }) => {
  const { t } = useTranslation();
  const isInOrgPage = Boolean(useMatch(ORG_PATH));
  const [templateType, clientId] = useCurrentTemplateList();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [{ total, offset }, setPaginationData] = useState({
    total: 0,
    offset: 0,
  });
  const [limit, setLimit] = useState(PAGINATION_PAGE_SIZE[0]);
  const controllerRef = useRef(null);
  const templateTypeRef = useRef({ templateType, clientId });

  const reset = useCallback(() => {
    setPaginationData({
      total: 0,
      offset: 0,
    });
    setLimit(PAGINATION_PAGE_SIZE[0]);
  }, []);

  const allowedAddToList = ({ destinationTemplateType, destinationId }) => {
    const { templateType: currentTemplateType, clientId: currentClientId } = templateTypeRef.current;
    switch (currentTemplateType) {
      case TEMPLATE_TABS.PERSONAL:
        return currentTemplateType.toUpperCase() === destinationTemplateType;
      case TEMPLATE_TABS.ORGANIZATION:
        return currentTemplateType.toUpperCase() === destinationTemplateType && currentClientId === destinationId;
      case TEMPLATE_TABS.TEAM:
        return (
          `ORGANIZATION_${currentTemplateType.toUpperCase()}` === destinationTemplateType &&
          currentClientId === destinationId
        );
      default:
        return false;
    }
  };

  const getParam = ({ options, signal }) => {
    const param = {
      limit: options.limit ?? PAGINATION_PAGE_SIZE[0],
      offset: options.offset ?? 0,
      searchKey: searchText,
      signal,
    };

    if (templateType === TEMPLATE_TABS.TEAM) {
      return {
        ...param,
        teamId: clientId,
      };
    }

    if (isInOrgPage && templateType !== TEMPLATE_TABS.TEAM) {
      return {
        ...param,
        orgId: clientId,
        tab: searchText
          ? ORGANIZATION_TEMPLATE_TABS.ORGANIZATION_ALL
          : MAPPING_TEMPLATE_TAB_TO_ORG_TEMPLATE_TABS[templateType],
      };
    }

    return {
      ...param,
      userId: clientId,
    };
  };

  const getTypeTemplateServices = () => {
    if (templateType === TEMPLATE_TABS.TEAM) {
      return TEMPLATE_TABS.TEAM;
    }

    if (isInOrgPage && templateType !== TEMPLATE_TABS.TEAM) {
      return TEMPLATE_TABS.ORGANIZATION;
    }

    return TEMPLATE_TABS.PERSONAL;
  };

  const getTemplates = useCallback(
    async (options = {}) => {
      try {
        setLoading(true);
        if (controllerRef.current) {
          controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();
        const { signal } = controllerRef.current;
        const type = getTypeTemplateServices();
        const params = getParam({ options, signal });
        const { edges, totalItem, pageInfo } = await templateServices.from(type).getAll(params);
        batch(() => {
          setPaginationData({ total: totalItem, offset: pageInfo.offset });
          setLoading(false);
          setTemplates(edges.map(({ node }) => node));
          setLimit(pageInfo.limit);
        });
      } catch (e) {
        toastUtils.error({
          message: t('templatePage.failedToGetTemplates'),
        });
      }
    },
    [clientId, searchText, templateType]
  );

  const onPageChange = (page) => {
    setPaginationData((prev) => ({ ...prev, offset: page - 1 }));
    getTemplates({
      offset: page - 1,
      limit,
    });
  };

  const onLimitChange = ({ value }) => {
    setLimit(value);
    setPaginationData((prev) => ({ ...prev, offset: 0 }));
    getTemplates({
      offset: 0,
      limit: value,
    });
  };

  const onAddItem = (template) => {
    const destination = {
      destinationTemplateType: template.belongsTo.type,
      destinationId: template.belongsTo.location._id,
    };
    if (allowedAddToList(destination)) {
      if (offset === 0) {
        setPaginationData((prev) => ({ ...prev, total: ++prev.total }));
        setTemplates((list) => [template, ...list.slice(0, limit - 1)]);
      } else {
        getTemplates({ offset, limit });
      }
    }
  };

  const onRemoveItem = (template) => {
    const { templateType: currentTemplateType } = templateTypeRef.current;
    const isLastPage = Math.ceil(total / limit) - 1 === offset;
    const isLastItemInPage = total % limit === 1;

    if (isLastPage && !isLastItemInPage) {
      setTemplates((prevList) => prevList.filter((item) => item._id !== template._id));
      setPaginationData((prev) => ({ ...prev, total: --prev.total }));
    } else {
      const newOffset = isLastItemInPage ? Math.max(offset - 1, 0) : null;
      getTemplates({ offset: newOffset });
    }
    templateEvent.deleteTemplateSuccess({
      fileId: template._id,
      location: currentTemplateType,
    });
  };

  const onEditItem = (editedTemplate) => {
    const { templateType: currentTemplateType } = templateTypeRef.current;
    setTemplates((prev) =>
      produce(prev, (draft) => {
        let template = draft.find((item) => item._id === editedTemplate._id);
        if (template) {
          template = merge(template, editedTemplate);
        }
      })
    );
    templateEvent.editTemplateSuccess({
      fileId: editedTemplate._id,
      location: currentTemplateType,
    });
    toastUtils.success({
      message: t('templatePage.templateHasBeenUpdated'),
    });
  };

  const onUpdateItem = (updatedTemplate) => {
    setTemplates((prev) =>
      produce(prev, (draft) => {
        let template = draft.find((item) => item._id === updatedTemplate._id);
        if (template) {
          template = merge(template, updatedTemplate);
        }
      })
    );
  };

  const onListChanged = (template, action) => {
    switch (action) {
      case TEMPLATE_UPDATE_ACTIONS.ADD:
        onAddItem(template);
        break;
      case TEMPLATE_UPDATE_ACTIONS.REMOVE:
        onRemoveItem(template);
        break;
      case TEMPLATE_UPDATE_ACTIONS.EDIT:
        onEditItem(template);
        break;
      case TEMPLATE_UPDATE_ACTIONS.UPDATE:
        onUpdateItem(template);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const options = {};
    if (searchText) {
      options.offset = 0;
    }
    getTemplates(options);
    return () => {
      reset();
    };
  }, [templateType, clientId, searchText, getTemplates, reset]);

  useEffect(() => {
    templateTypeRef.current = {
      templateType,
      clientId,
    };
  }, [templateType, clientId]);

  return {
    getTemplates,
    templates,
    loading,
    update: setTemplates,
    onListChanged,
    pagination: {
      offset,
      limit,
      total,
      onPageChange,
      onLimitChange,
    },
  };
};

export default useGetTemplates;

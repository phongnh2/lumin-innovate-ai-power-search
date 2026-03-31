import { useCallback, useMemo } from 'react';

import {
  dismissAllWidgetNotifications,
  dismissWidgetNotification,
  previewAllWidgetNotification,
  previewWidgetNotification,
  createWidgetNotification,
} from 'services/graphServices/widgetNotification';

import { queryClient } from 'utils/queryClient';

import { activityFeedQueryKey, useActivityFeedQuery } from './useActivityFeedQuery';

export type ActivityFeedItem = {
  _id: string;
  userId: string;
  type: string;
  createdAt: string;
  isPreviewed: boolean;
  isRead: boolean;
  isNewWidget: boolean;
};

type UseActivityFeedQueryProps = {
  enabled?: boolean;
};

export const useActivityFeedHandlers = (props?: UseActivityFeedQueryProps) => {
  const { enabled = false } = props || {};
  const { data: remoteWidgets, refetch, isRefetching, isLoading, error, isFetched } = useActivityFeedQuery({ enabled });

  const createWidget = useCallback(async (widgetType: string) => {
    const result = (await createWidgetNotification({ widgetType })) as {
      data: {
        createWidgetNotification: {
          data: ActivityFeedItem;
        };
      };
    };
    const newWidget = result?.data?.createWidgetNotification.data;
    queryClient.setQueryData([activityFeedQueryKey], (oldData: ActivityFeedItem[]) => oldData.concat([newWidget]));
  }, []);

  const previewWidgetNotifications = async (ids: string[]) => {
    queryClient.setQueryData([activityFeedQueryKey], (oldData: ActivityFeedItem[]) =>
      oldData?.filter((item) => (ids.includes(item._id) ? { ...item, isPreviewed: true } : item))
    );
    await previewWidgetNotification(ids);
  };

  const previewAll = useCallback(async () => {
    const hasOneUnPreviewed = remoteWidgets?.some((item) => !item.isPreviewed);
    if (hasOneUnPreviewed) {
      queryClient.setQueryData([activityFeedQueryKey], (oldData: ActivityFeedItem[]) =>
        oldData?.map((item) => ({ ...item, isPreviewed: true }))
      );
      await previewAllWidgetNotification();
    }
  }, [remoteWidgets]);

  const dismissActivityFeedItem = async (id: string) => {
    queryClient.setQueryData([activityFeedQueryKey], (oldData: ActivityFeedItem[]) =>
      oldData?.map((item) => (item._id === id ? { ...item, isRead: true } : item))
    );
    await dismissWidgetNotification(id);
  };

  const dismissAllActivityFeedItems = async () => {
    queryClient.setQueryData([activityFeedQueryKey], (oldData: ActivityFeedItem[]) =>
      oldData?.map((item) => ({
        ...item,
        isRead: true,
      }))
    );
    await dismissAllWidgetNotifications();
  };

  const filteredReadWidgets = useMemo(() => remoteWidgets?.filter((item) => !item.isRead), [remoteWidgets]);

  return {
    rawData: remoteWidgets,
    data: filteredReadWidgets,
    previewWidgetNotifications,
    previewAllWidgetNotifications: previewAll,
    dismissAllActivityFeedItems,
    dismissActivityFeedItem,
    createWidgetNotification: createWidget,
    loading: isLoading,
    error,
    refetch,
    isRefetching,
    isFetched,
  };
};

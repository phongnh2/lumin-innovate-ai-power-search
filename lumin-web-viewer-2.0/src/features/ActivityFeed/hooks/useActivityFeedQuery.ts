import { useQuery } from '@tanstack/react-query';

import { getWidgets } from 'services/graphServices/widgetNotification';

export type UseActivityFeedQueryProps = {
  enabled?: boolean;
};

export const activityFeedQueryKey = 'activityFeed';

const getActivityFeed = async () => {
  const result = (await getWidgets()) as {
    data: {
      widgetNotifications: {
        widgetList: Record<string, unknown>[];
      };
    };
  };
  return result.data.widgetNotifications.widgetList;
};

export const useActivityFeedQuery = (props?: UseActivityFeedQueryProps) => {
  const { enabled = false } = props || {};
  return useQuery({
    queryKey: [activityFeedQueryKey],
    queryFn: getActivityFeed,
    enabled,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

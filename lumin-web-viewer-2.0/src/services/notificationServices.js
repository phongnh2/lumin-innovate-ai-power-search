import * as notificationGraph from 'services/graphServices/notification';

async function getNotificationById(notificationId) {
  const res = await notificationGraph.getNotificationById(notificationId);
  return res.data.getNotificationById;
}

export default {
  getNotificationById
};
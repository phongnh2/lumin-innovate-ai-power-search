import { socket } from '@socket';

import { SOCKET_ON } from 'constants/socketConstant';

import { IOnSocketSummarizationCompleted } from "../interfaces";

export function useSummarizeCompleted() {
  const socketListener = (): Promise<IOnSocketSummarizationCompleted> => new Promise((resolve) => {
    socket.on(SOCKET_ON.SUMMARIZATION_COMPLETED, (data: IOnSocketSummarizationCompleted) => {
      resolve(data);
    });
  });

  return {
    summarizedCompleted: socketListener,
  };
};
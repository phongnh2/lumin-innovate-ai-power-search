import { io } from 'socket.io-client';

import { SOCKET_ON, SOCKET_EMIT } from '@/constants/socket';
import sessionManagement from '@/lib/session';

export function createSocketClient({ extraHeaders }: { extraHeaders: { [header: string]: string } }) {
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL, {
    transports: ['websocket'],
    forceNew: true,
    extraHeaders
  });
  socket.on(SOCKET_ON.Common.Connect, async () => {
    const token = await sessionManagement.getAuthorizeToken();
    socket.emit(SOCKET_EMIT.AUTH.CONNECTION_INIT, {
      authorization: token
    });
  });
  socket.on(SOCKET_ON.Common.AUTHENTICATED, () => {
    socket.emit(SOCKET_EMIT.User.JoinRoom);
  });
  return socket;
}

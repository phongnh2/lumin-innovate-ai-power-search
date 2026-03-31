import { Socket } from 'socket.io';

export class SocketInitialize {
  private socket: Socket;

  private rooms: string[];

  createSocketInstance(socket): this {
    this.socket = socket;
    this.rooms = [];
    return this;
  }

  prepareRoom(roomName: string): this {
    this.rooms.push(roomName);
    return this;
  }

  join(): void {
    this.rooms.forEach((roomName) => {
      this.socket.join(roomName);
    });
  }
}

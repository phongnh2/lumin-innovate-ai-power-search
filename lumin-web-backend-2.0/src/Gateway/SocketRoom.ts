export enum SocketRoom {
  Signature = 'user-signature-',
  Document = 'document-room-',
  User = 'user-room-',
}

export class SocketRoomGetter {
  static document(roomId: string): string {
    return SocketRoom.Document + roomId;
  }

  static signature(userId: string): string {
    return SocketRoom.Signature + userId;
  }

  static user(userId: string): string {
    return SocketRoom.User + userId;
  }
}

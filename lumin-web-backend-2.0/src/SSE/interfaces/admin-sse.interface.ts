export interface Member {
  _id: string;
  email: string;
  name: string;
  role: string;
}

export interface MemberChunkPayload {
  chunkIndex: number;
  members: Member[];
  isLastChunk: boolean;
}

export interface MemberMessageEvent {
  data: MemberChunkPayload;
  id?: string;
  event?: string;
}

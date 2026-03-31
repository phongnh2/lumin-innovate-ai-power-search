import { Types } from 'mongoose';

String.prototype.toHexString = function (): string {
  return new Types.ObjectId(this).toHexString();
};
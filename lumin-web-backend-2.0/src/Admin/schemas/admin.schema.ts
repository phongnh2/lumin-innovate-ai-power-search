import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { AdminStatus } from 'Admin/admin.enum';

const AdminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: {
    type: String,
    select: false,
  },
  role: String,
  timezoneOffset: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  avatarRemoteId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: AdminStatus.PENDING,
  },
});

async function comparePassword(candidatePassword: string): Promise<boolean> {
  const candidatePasswordsha256 = crypto
    .createHash('sha256')
    .update(candidatePassword)
    .digest('hex');
  return bcrypt
    .compare(`${candidatePasswordsha256}`, this.password)
    .catch(() => {
      throw GraphErrorException.BadRequest('Error validating password');
    });
}

AdminSchema.methods.comparePassword = comparePassword;
AdminSchema.index({ email: 1 }, { unique: true });

export default AdminSchema;

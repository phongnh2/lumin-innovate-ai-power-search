
import * as mongoose from 'mongoose';

const PermissionSchema = new mongoose.Schema({
  name: String,
  effect: String,
}, { _id: false });

export default PermissionSchema;

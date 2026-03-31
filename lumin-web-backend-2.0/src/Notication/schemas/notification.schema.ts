import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const ActorSchema = new mongoose.Schema({
  actorId: ObjectId,
  actorName: String,
  type: String,
  avatarRemoteId: String,
  actorData: Object,
}, { _id: false });

const Entity = new mongoose.Schema({
  entityId: ObjectId,
  entityName: String,
  type: String,
  entityData: Object,
}, { _id: false });

const Target = new mongoose.Schema({
  targetId: ObjectId,
  targetName: String,
  type: String,
  targetData: Object,
}, { _id: false });

const NotificationSchema = new mongoose.Schema({
  actor: ActorSchema,
  entity: Entity,
  target: Target,
  actionType: Number,
  notificationType: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

NotificationSchema.index({ actionType: 1 });

export default NotificationSchema;

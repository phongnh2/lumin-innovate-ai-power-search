import mongoose from 'mongoose';

const SlackConnection = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  slackTeamId: String,
  slackUserId: String,
  credential: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

SlackConnection.index({ userId: 1, slackTeamId: 1, slackUserId: 1 });
export default SlackConnection;

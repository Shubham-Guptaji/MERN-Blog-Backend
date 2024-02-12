import { Schema, model } from 'mongoose';

const followerSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  }
}, {timestamps: true});

const Follower = model('Follower', followerSchema);

export default Follower;

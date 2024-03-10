import { Schema, model } from 'mongoose';

const followerSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, "Author Id is required"]
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User Id is required."]
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog'
  }
}, {timestamps: true});

const Follower = model('Follower', followerSchema);

export default Follower;

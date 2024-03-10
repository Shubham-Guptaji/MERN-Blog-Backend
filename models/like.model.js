import { Schema, model } from 'mongoose';

const likeSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, "Author Id is required"]
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User Id is required"]
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, "Blog Id is required"]
  }
}, {timestamps: true});

const Like = model('Like', likeSchema);

export default Like;

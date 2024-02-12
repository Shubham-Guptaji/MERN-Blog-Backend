import { Schema, model } from 'mongoose';

const likeSchema = new Schema({
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

const Like = model('Like', likeSchema);

export default Like;

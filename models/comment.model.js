import { Schema, model } from 'mongoose';

const commentSchema = new Schema({
  content: {
    type: String,
    required: [true, "Comment is required."]
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Author Id is required."]
  },
  blogAuthor: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, "Blog Author id is required"]
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, "Blog Id is required."]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {timestamps: true});

const Comment = model('Comment', commentSchema);

export default Comment;

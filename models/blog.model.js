import { Schema, model } from 'mongoose';

const blogSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"]
  },
  content: {
    type: Object,
    required: [true, "Content is required for the post."]
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tags: [String],
  likes: {
    type: Number,
    default: 0
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  isPublished: {
    type: Boolean,
    default: false
  },
  seoKeywords: {
    type: String,
    default: ''
  },
  metaDescription: {
    type: String,
    default: ''
  },
  public_image: {
    resource_id: {
        type: String
    },
    resource_url: {
        type: String
    }
  }
}, {timestamps: true});

const Blog = model('Blog', blogSchema);

export default Blog;

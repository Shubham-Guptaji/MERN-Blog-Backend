import { Schema, model } from 'mongoose';

const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: Object,
    required: true
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
  tags: {
    type: [String],
    default: []
  },
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
        string: true,
        required: true
    },
    resource_url: {
        string: true,
        required: true
    }
  }
}, {timestamps: true});

const Blog = model('Blog', blogSchema);

export default Blog;

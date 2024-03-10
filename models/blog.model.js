import { Schema, model } from 'mongoose';

const blogSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Author id is required"],
  },
  title: {
    type: String,
    required: [true, "Title is required"]
  },
  seoKeywords: {
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
  },
  tags: [String],
  metaDescription: {
    type: String,
    default: ''
  },
  content: {
    type: Object,
    required: [true, "Content is required for the post."]
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
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {timestamps: true});

const Blog = model('Blog', blogSchema);

export default Blog;

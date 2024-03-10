import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    lowercase: true,
    minlength: [6, 'Username should be minimum 6 characters long'],
    unique: [true, 'Username is already taken'],
  },
  email: {
    type: String,
    required: [true, 'Email is mandatory'],
    unique: [true, 'Email already registered'],
    lowercase: true,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please fill in a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    select: false
  },
  firstName: {
    type: String,
    trim: true,
    required: [true, 'Firstname is required']
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, 'Lastname is required']
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  avatar: {
    public_id : String,
    secure_url : String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  blogs: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
  followers: {
    type: Number,
    default: 0
  },
  resetToken: String,
  resetTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
  refreshToken: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {timestamps: true});


userSchema.pre('save', async function (next) {
  if(!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods = {
  comparePassword : async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  },

  generateAccessToken : async function () {
    return jwt.sign(
      {
        id:this._id, 
        username: this.username,
        email: this.email, 
        role: this.role, 
        isBlocked: this.isBlocked, 
        isVerified: this.isVerified, 
        isClosed: this.isClosed
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
    )
  },

  generateRefreshToken : async function () {
    return jwt.sign(
      {
        id: this._id
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRTY
      }
    )
  },

  generatePasswordResetToken: async function () {
    const token = crypto.randomBytes(20).toString('hex');

    this.resetToken = crypto.createHash('sha256').update(token).digest('hex');

    this.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    return token;

  },

  generateVerifyToken: async function () {
    const token = crypto.randomBytes(20).toString('hex');

    this.verifyToken = crypto.createHash('sha256').update(token).digest('hex');
    this.verifyTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    return token;
  }
}

const User = model('User', userSchema);

export default User;

import asyncHandler from "../middlewares/async.middleware.js";
import Blog from "../models/blog.model.js";
import Follower from "../models/follower.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";

/**
 * @ContactForm
 * @Route {{URL}}/api/v1/contact
 * @Method post
 * @Access public
 * @ReqData name, email, subject, message
 */

export const contactformHandler = asyncHandler(async function(req, res, next) {
    try {
        const { name, email, subject, message } = req.body;

        if(!name || !email || !subject || !message) {
            return next(new AppError("All fields are mandatory", 400))
        }

        const newContact = await ContactForm.create({
          name,
          email,
          subject,
          message
        });
    
        await newContact.save();

        res.status(200).json({ success: true, message: 'Form submitted successfully!' });
    
      } catch (error) {
        console.error('Error submitting contact form:', error);
        return next(new AppError("Some Error occurred! Try again later", 500))
      }
})

/**
 * @FollowUser
 * @Route {{URL}}/api/v1/follower/follow
 * @Method post
 * @Access private
 * @ReqData authUsername, blogId
 */

export const followUser = asyncHandler(async function (req, res, next) {
  const { blogId, authUsername } = req.body;
  if(!authUsername) {
    return next(new AppError("Invalid Author", 404))
  }
  let follow;
  try {
    if(blogId) {
      const blog = await Blog.findById(blogId);
      if(!blog) {
        return next(new AppError("Invalid BlogId", 404))
      }
      follow = await Follower.create({
        author: blog.author,
        user: req.user.id,
        blog: blog._id
      })
    } else {
      const author = await User.findOne({username: authUsername});
      if(!author) {
        return next(new AppError("Invalid Author", 404))
      }
      follow = await Follower.create({
        author: author._id,
        user: req.user.id
      })
    }
    if(!follow) {
      return next(new AppError("Your request couldn't be processed", 500))
    }
    const userUpdate = await User.findByIdAndUpdate(follow.author, { $inc: { followers: 1 } });
    await userUpdate.save();
    await follow.save();
    res.status(200).json({
      success: true,
      message: "Followed successfully"
    })
  }catch(error) {
    console.log(error)
    return next(new AppError("Some Error occurred! Try again later ", 500))
  }
})

/**
 * @UnFollowUser
 * @Route {{URL}}/api/v1/follower/unfollow
 * @Method delete
 * @Access private(logged in users only)
 * @ReqData commentId, 
 */

export const unfollowUser = asyncHandler(async function (req, res, next) {
  const {FollowId} = req.params;
  if(!FollowId) {
    return next(new AppError("Follow Id is required.", 400))
  }
  const follow = await Follower.findById(FollowId);
  if(!follow) {
    return next(new AppError("Wrong Follower Id", 400))
  }
  if(follow.user.toString() !== req.user.id) {
    return next(new AppError("Not authorized", 401))
  }
  const result = await Follower.findByIdAndDelete(FollowId)
  if(!result) {
    return next(new AppError("Please try again later...", 500))
  }
  const userUpdate = await User.findByIdAndUpdate(follow.author, { $inc: { followers: -1 } });
  await userUpdate.save();

  res.status(200).json({
    success: true,
    message: "Unfollowed Successfully"
  })
})

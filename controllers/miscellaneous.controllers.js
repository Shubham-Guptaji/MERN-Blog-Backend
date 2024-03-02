import mongoose from "mongoose";
import asyncHandler from "../middlewares/async.middleware.js";
import Blog from "../models/blog.model.js";
import Follower from "../models/follower.model.js";
import Like from "../models/like.model.js";
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
 * @ReqData authId, blogId
 */

export const followUser = asyncHandler(async function (req, res, next) {
  const { blogId, authId } = req.body;
  if (!authId) {
    return next(new AppError("Invalid Author", 404));
  }
  try {
    // Check if user is already following the blogger or not
    const [author, user, followInfo] = await Promise.all([
      User.findById(authId),
      User.findById(req.user.id),
      Follower.findOne({ author: authId, user: req.user.id })
    ]);

    if (!author || author.isClosed || author.isBlocked) {
      return next(new AppError("Invalid Author", 404));
    }

    if (!user || user.isClosed || user.isBlocked) {
      return next(new AppError("Not Authorized to follow", 403));
    }

    if (followInfo) {
      return next(new AppError("You have already followed this Blogger.", 409));
    }

    let follow;

    if (blogId) {
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return next(new AppError("Invalid BlogId", 404));
      }
      follow = await Follower.create({
        author: blog.author,
        user: req.user.id,
        blog: blog._id
      });
    } else {
      follow = await Follower.create({
        author: authId,
        user: req.user.id
      });
    }

    if (!follow) {
      return next(new AppError("Your request couldn't be processed", 500));
    }

    // Increment followers count for the followed author directly
    author.followers += 1;
    await author.save();

    res.status(200).json({
      success: true,
      message: "Followed successfully"
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Some Error occurred! Try again later ", 500));
  }
});



/**
 * @GetFollowers
 * @Route {{URL}}/api/v1/followers
 * @Method post
 * @Access private(only for post authors)
 * @ReqData username, id, skip, limit
 */

export const userFollowers = asyncHandler(async function (req, res, next) {
  const { id, username } = req.user;
  const skip = req.body.skip || 0;
  const limit = (req.body.limit || 10) + 1;
  let newId = mongoose.Types.ObjectId.createFromHexString(id);
  const getFollowers = await Follower.aggregate([
    { $match : { author : newId }},
    { $lookup : {
      from : 'users',
      localField : 'user',
      foreignField : '_id',
      as : 'user_info'
    }},
    
    {
      $facet: {
        user_info: [
          { $skip: skip },
          { $limit: limit }
        ]
      }
    },
    { $unwind: '$user_info' }, // Deconstruct the array of follower documents
    {
      $project: {
        user_info : 1,
        blog: 1
      }
    }
  ]);
  let areMoreFollowers = false;
  // Check if user_info array exists before accessing it
  if (getFollowers) {
    let result = [];
    if(getFollowers.length === 11) areMoreFollowers = true;
    let followerData = getFollowers.length === 11 ? getFollowers.slice(0,11) : getFollowers;
    (followerData).map((data) => {
      let obj = { 
        blogId : data.user_info.blog,
        userId : data.user_info.user,
        username : data.user_info.user_info[0].username,
        fullName : `${data.user_info.user_info[0].firstName} ${data.user_info.user_info[0].lastName}`,
        joinDate : data.user_info.createdAt ,
      };
      result.push(obj);
    })
    res.status(200).json({
      success: true,
      message: "Followers fetched successfully",
      followers: result,
      areMoreFollowers
    });
  } else {
    res.status(200).json({
      success : true,
      message: "Followers fetched successfully",
      followers: [], // Return an empty array if there are no followers
      areMoreFollowers
    });
  }
});

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

/**
 * @LikePost
 * @Route  {{URL}}/api/v1/like/:postId
 * @Method post
 * @Access private (logged in users)
 * @ReqData postId
 */

export const LikePost = asyncHandler(async function(req, res, next) {
  const  {postId} = req.params;
  
  // Check if the user already liked this post
  let likeinfo = await Like.findOne({blog : postId, user: req.user.id});
  if(likeinfo) {
    return next(new AppError('You have already Liked this Post', 400));
  }

  // Create a new like
  likeinfo = await Like.create({ blog: postId, user: req.user.id });

  // Increment the likes count of the Blog by 1
  const blog = await Blog.findByIdAndUpdate(postId, { $inc:{likes: 1} },{new:true});

  if(!blog) {
    return next(new AppError('Blog not found!', 404));
  }

  // Send response
  res.status(200).json({
    success:true,
    message: "Liked the post",
    data:likeinfo
  })
})

/**
 * @DisLikePost
 * @Route  {{URL}}/api/v1/dislike/:postId
 * @Method delete
 * @Access private (logged in users)
 * @ReqData postId
 */

export const DisLikePost = asyncHandler(async function (req, res, next) {
  const {postId} = req.params;

  // Get the information about the current user's like on this post
  let likeInfo = await Like.findOneAndDelete({blog:postId , user:req.user.id});

  if (!likeInfo){
    return next(new AppError("You haven't liked this post yet", 400))
  }

  // Decrement the number of likes for the blog
  await Blog.findByIdAndUpdate(postId, { $inc : { likes : -1 } }).catch((err)=>{console.log(err)});
  
  // Return the updated info to the client side
  res.status(200).json({
      status:'success',
      data:likeInfo
  });
})

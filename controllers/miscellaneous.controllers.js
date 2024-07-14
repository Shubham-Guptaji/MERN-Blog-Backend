import mongoose from "mongoose";
import asyncHandler from "../middlewares/async.middleware.js";
import Blog from "../models/blog.model.js";
import Follower from "../models/follower.model.js";
import Like from "../models/like.model.js";
import ContactForm from "../models/contact.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import sendEmail from "../utils/emailHandler.js";

/**
 * @ContactForm
 * @Route {{server}}/contact
 * @Method post
 * @Access public
 * @ReqData name, email, subject, message
 */

export const contactformHandler = asyncHandler(async function (req, res, next) {

  try {
    // Extract form data from the request body
    const { name, email, subject, message } = req.body;
    // Check if all fields are present
    if (!name || !email || !subject || !message) {
      // Return an error if any field is missing
      return next(new AppError("All fields are mandatory", 400));
    }

    // Create a new contact form entry with the provided data
    const newContact = await ContactForm.create({
      name,
      email,
      subject,
      message
    });

    // Save the new entry to the database
    await newContact.save();
    const newMessage = `
      <h2>New Message Received at Alcodemy Blog</h2>
      <p><b>Name: </b>${newContact.name}</p>
      <p><b>Email: </b><a href="mailto:${newContact.email}">${newContact.email}</a></p>
      <p><b>Subject: </b>${newContact.subject}<br/></p>
      <p><b>Message: </b><i>${newContact.message}</i></p>
    `
    sendEmail(process.env.CONTACT_US_EMAIL, subject, newMessage)

    // Send a success response
    res.status(200).json({ success: true, message: 'Form submitted successfully!' });

  } catch (error) {
    // Return a server error response in case of any
    return next(new AppError("Some Error occurred! Try again later", 500))
  }
});

/**
 * @AllContacts
 * @Route {{server}}/contact
 * @Method GET
 * @Access private(admin only)
 * @ReqData skip
 */

export const AllContacts = asyncHandler(async function (req, res, next) {
  // Get the skip from query;
  const skip = req.query.skip ? parseInt(req.query.skip) : 0;
  const limit = 21;

  // Finding contact from database
  const contacts = await ContactForm.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

  // If no contacts found
  if (!contacts || !contacts.length) { contacts = [] }

  // Sending response
  res
  .status(200)
  .json({ 
    success: true, 
    message: "Contacts fetched successfully", 
    data: contacts, 
    areMore: contacts.length > 20 ? true : false 
  });
})

/**
 * @DeleteContacts
 * @Route {{server}}/contact/:id
 * @Method Delete
 * @Access private(admin only)
 * @ReqData id
 */

export const DeleteContact = asyncHandler(async function (req, res, next) {
  try {
    // Get id from parameter
    const id = req.params.id;
    // Find contact by ID and delete it
    let contact = await ContactForm.findByIdAndDelete(id);
    
    // Checking if there is a contact with that ID or not
    if (!contact) return next(new AppError("No contact with this ID found.", 404));
  
    // Send Response
    res.status(200).json({  
      success: true,  
      message: `Deleted contact ${contact._id}`,  
    });
  } catch (error) {
    next(new AppError("Contact Id is incorrect", 404));
  }
})

/**
 * @IsFollowing
 * @Route {{server}}/isfollowing
 * @Method post
 * @Access private(logged in users)
 * @ReqData authId
 */

export const IsFollowing = asyncHandler(async function (req, res, next) {
  const { authId } = req.body;
  // Check if author Id is present in the request body
  if (!authId ) {
    return next(new AppError("Author Id is required.", 404));
  }

  try {
    // Check if user is already following the blogger or not
    const [author, followInfo] = await Promise.all([
      User.findById(authId),
      Follower.findOne({ author: authId, user: req.user.id })
    ]);

    // Check if author exists and is not closed or blocked
    if (!author || author.isClosed || author.isBlocked) {
      return next(new AppError("Invalid Author", 404));
    }
    let isFollowing = false;
    let data = {};
    // Check if user is already following the author or not
    if (followInfo) {
      isFollowing = true;
      data.id = followInfo._id;
    }
    data.isFollowing = isFollowing;
    // Send a success response
    res.status(200).json({
      success: true,
      message: "Following",
      data,
    });

  } catch (error) {
    console.log(error);
    return next(new AppError("Some Error occurred! Try again later ", 500));
  }
});


/**
 * @FollowUser
 * @Route {{server}}/follower/follow
 * @Method post
 * @Access private(logged in users)
 * @ReqData authId, blogId
 */

export const followUser = asyncHandler(async function (req, res, next) {
  const { blogId, authId } = req.body;

  // Check if author Id is present in the request body
  if (!authId) {
    return next(new AppError("Author Id is required.", 404));
  }

  try {
    // Check if user is already following the blogger or not
    const [author, followInfo] = await Promise.all([
      User.findById(authId),
      Follower.findOne({ author: authId, user: req.user.id })
    ]);

    // Check if author exists and is not closed or blocked
    if (!author || author.isClosed || author.isBlocked) {
      return next(new AppError("Invalid Author", 404));
    }

    // Check if user is already following the author or not
    if (followInfo) {
      return next(new AppError("You have already following this Blogger.", 409));
    }

    let follow;

    // Create a new follower document with the provided data
    if (blogId) {
      const blog = await Blog.findOne({ _id: blogId, author: authId, isPublished: true });

      // Check if blog exists
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
    // Check if follow document was created successfully
    if (!follow) {
      return next(new AppError("Your request couldn't be processed", 500));
    }

    // Increment followers count for the followed author directly
    author.followers += 1;
    await author.save();
    await User.findByIdAndUpdate(req.user.id, { $inc: { following: 1 } }, { new: true });

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Followed successfully",
      id: follow._id
    });

  } catch (error) {
    console.error('Error following user:', error);
    return next(new AppError("Some Error occurred! Try again later ", 500));
  }
});

/**
 * @GetFollowers
 * @Route {{server}}/followers
 * @Method get
 * @Access private(only for post authors)
 * @ReqData skip
 */

export const userFollowers = asyncHandler(async function (req, res, next) {
  // Get the skip from parameters
  const skip = Number(req.query.skip) || 0;
  const limit = 21;
  const newId = mongoose.Types.ObjectId.createFromHexString(req.user.id);

  // Fetch followers for the author and process data in the pipeline
  const getFollowers = await Follower.aggregate([
    {
      $match: { author: newId }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user_info'
      }
    },
    {
      $unwind: '$user_info'
    },
    {
      $match: {
        "user_info.isClosed": false,
        "user_info.isBlocked": false,
      },
    },
    // {
    //   $lookup: {
    //     from: "blogs",
    //     localField: "blog",
    //     foreignField: "_id",
    //     as: "blog_info"
    //   }
    // },
    // {
    //   $unwind: '$blog_info'
    // },
    {
      $project: {
        // blogId: '$blog',
        // userId: '$user_info._id',
        // blog_name: '$blog_info.title',
        // blog_url: '$blog_info.url',
        avatar: '$user_info.avatar.secure_url',
        username: '$user_info.username',
        // fullName: { $concat: ['$user_info.firstName', ' ', '$user_info.lastName'] },
        fullName: '$user_info.firstName',
        createdAt: 1
      }
    },
    {
      $sort: {createdAt: -1}
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ]);

  let areMoreFollowers = false;
  let result = [];

  // Process the fetched followers data
  if (getFollowers && getFollowers.length > 0) {
    if (getFollowers.length === 21) areMoreFollowers = true;

    getFollowers.forEach(data => {
      result.push(data);
    });
  }

  // Sending the response
  res.status(200).json({
    success: true,
    message: "Followers fetched successfully",
    followers: result,
    areMoreFollowers
  });
});


/**
 * @UserFollowing
 * @Route {{server}}/following
 * @Method get
 * @Access private(logged in users only)
 * @ReqData skip
 */

export const UserFollowing = asyncHandler(async function (req, res, next) {
  const skip = req.query.skip ? parseInt(req.query.skip) : 0;
  const limit = 21; // Limiting to 21 authors as requested

  // Fetch authors for the user
  const Authors = await Follower.aggregate([
    /**
     * Match the Follower documents where the user field matches the logged-in user's id
     */
    { $match: { user: mongoose.Types.ObjectId.createFromHexString(req.user.id) } }, // Convert user id to ObjectId

    /**
     * Look up the author's user document and join it with the Follower document
     */
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },

    /**
     * Unwind the author array so we can access the user document directly
     */
    { $unwind: "$author" },

    /**
     * Match only authors who are not closed or blocked
     */
    {
      $match: {
        "author.isClosed": false,
        "author.isBlocked": false,
      },
    },

    /**
     * Skip the number of documents based on the 'skip' parameter
     */
    { $skip: skip },

    /**
     * Limit the number of documents to 21
     */
    { $limit: limit },
    
    // {
    //   $lookup: {
    //     from: "blogs",
    //     localField: "blog",
    //     foreignField: "_id",
    //     as: "blog_info"
    //   }
    // },
    // {
    //   $unwind: '$blog_info'
    // },

    /**
     * Project only the required fields
     */
    {
      $project: {
        _id: 1,
        // author: {
        //   _id: 1,
        //   username: 1,
        //   firstName: 1,
        //   lastName: 1,
        // },
        // blog_url: '$blog_info.url',
        avatar: '$author.avatar.secure_url',
        username: '$author.username',
        fullName: "$author.firstName",
        createdAt: 1
      },
    },
    {
      $sort: {createdAt: -1}
    },

  ]);

  if (!Authors || !Authors.length) {
    return res.status(200).json({
      success: true,
      message: "You are not following anyone yet",
      authors: [],
      areMore: false,
    });
  }

  res.status(200).json({
    success: true,
    message: "Authors you are following",
    authors: Authors,
    areMore: Authors.length > 20 ? true : false,
  });
});

/**
 * @UnFollowUser
 * @Route {{server}}/follower/unfollow/:FollowId
 * @Method delete
 * @Access private(logged in users only)
 * @ReqData FollowId, 
 */

export const unfollowUser = asyncHandler(async function (req, res, next) {
  // Extract the FollowId from the request parameters
  const { FollowId } = req.params;

  // Check if FollowId is provided
  if (!FollowId) {
    return next(new AppError("Follow Id is required.", 400));
  }

  // Find the follower by its Id
  const follow = await Follower.findById(FollowId);

  // Check if a follower document was found
  if (!follow) {
    return next(new AppError("Wrong Follower Id", 400));
  }

  // Ensure that the logged-in user is the owner of the follow document
  if (follow.user.toString() !== req.user.id) {
    return next(new AppError("Not authorized", 401));
  }

  // Delete the follower document
  const result = await Follower.findByIdAndDelete(FollowId);

  // Check if the follower document was successfully deleted
  if (!result) {
    return next(new AppError("Please try again later...", 500));
  }

  // Decrement the followers count for the author
  const userUpdate = await User.findByIdAndUpdate(follow.author, { $inc: { followers: -1 } });
  await userUpdate.save();
  await User.findByIdAndUpdate(req.user.id, { $inc: { following: -1 } }, { new: true });

  // Return the success response
  res.status(200).json({
    success: true,
    message: "Unfollowed Successfully",
  });
});

/**
 * @CurrentPostLikeCount
 * @Route {{URL}}/api/v1/likecount
 * @Method post
 * @Access private (logged in users) 
 * @ReqData postId, authId
 */

export const PostLikes = asyncHandler(async function (req, res, next) {
  // Extract the postId from the request parameters
  const { postId, userId } = req.body;
  try {
    if(!postId) return next(new AppError("PostId is required", 400));
    // Count Likes;
    const totalLikes = await Blog.find({ _id: postId, isPublished: true }).select("likes");
    if(!totalLikes) return next(new AppError("Invalid PostId", 400));
  
      let isLiked = false;
      let likeinfo
      if(userId) likeinfo = await Like.findOne({ blog: postId, user: userId });
      if (likeinfo) isLiked = true;
  
    // Return the success response
    res.status(200).json({
      success: true,
      message: "Likes Count fetched successfully.",
      data: {
        totalLikes: totalLikes[0].likes,
        isLiked
      }
    })
  } catch (error) {
      return next(new AppError("Can't get the likes count.."));
  }
})

/**
 * @LikePost
 * @Route  {{URL}}/api/v1/like/:postId
 * @Method get
 * @Access private (logged in users)
 * @ReqData postId
 */

export const LikePost = asyncHandler(async function (req, res, next) {
  // Extract the postId from the request parameters
  const { postId } = req.params;

  // Check if the user already liked this post
  let likeinfo = await Like.findOne({ blog: postId, user: req.user.id });
  if (likeinfo) {
    // If the user already liked the post, return an error
    return next(new AppError('You have already Liked this Post', 400));
  }

  // Increment the likes count of the Blog by 1
  const blog = await Blog.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true });

  if (!blog) {
    // If the blog is not found, return an error
    return next(new AppError('Blog not found!', 404));
  }
  await User.findByIdAndUpdate(blog.author, { $inc: { likes: 1 } }, { new: true });
  // Create a new like
  await Like.create({ blog: postId, user: req.user.id, author: blog.author });

  // Send response
  res.status(200).json({
    success: true,
    message: "Liked the post",
    data: {
      totalLikes : blog.likes,
      isLiked : true
    }
  })
})

/**
 * @DisLikePost
 * @Route  {{URL}}/api/v1/dislike/:postId
 * @Method delete
 * @Access private (logged in users)
 * @ReqData postId
 */

export const UnLikePost = asyncHandler(async function (req, res, next) {
  // Extract the postId from the request parameters
  const { postId } = req.params;

  // Get the information about the current user's like on this post
  let likeInfo = await Like.findOneAndDelete({ blog: postId, user: req.user.id });

  // If the user hasn't liked this post yet, return an error
  if (!likeInfo) {
    return next(new AppError("You haven't liked this post yet", 400));
  }

  // Decrement the number of likes for the blog
  const blog = await Blog.findByIdAndUpdate(postId, { $inc: { likes: -1 } }, {new: true}).catch((err) => {
    console.log(err);
  });

  if (!blog) {
    // If the blog is not found, return an error
    return next(new AppError('Blog not found!', 404));
  }

  // Delete the like information from the database
  await Like.findByIdAndDelete(likeInfo._id);
  await User.findByIdAndUpdate(blog.author, { $inc: { likes: -1 } }, {new: true})
  // Return the updated info to the client side
  res.status(200).json({
    status: true,
    message: "Unliked the post",
    data: {
      totalLikes : blog.likes,
      isLiked : false
    }
  });
});

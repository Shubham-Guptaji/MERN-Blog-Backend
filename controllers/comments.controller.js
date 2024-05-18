import asyncHandler from "../middlewares/async.middleware.js";
import Blog from "../models/blog.model.js";
import mongoose from 'mongoose';
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";

/** 
 * @Comments
 * @Route {{server}}/comments
 * @Method post
 * @Access private(only logged in users)
 * @ReqData comment, blogId 
 */

export const CreateComment = asyncHandler(async function (req, res, next) {
    const { blogId, comment } = req.body;

    // Check if blogId or comment is missing
    if (!blogId || !comment) {
        return next(new AppError("Comment and BlogId is required", 400));
    }

    // Find the blog to which the comment will be added
    const commentToBlog = await Blog.findOne({_id: blogId, isPublished: true});

    // Check if the blog exists
    if (!commentToBlog) {
        return next(new AppError("BlogId is invalid", 404))
    }

    // Find the user associated with the request
    const user = await User.findById(commentToBlog.author);

    // Checking user status
    if (!user || !user.isVerified || user.isClosed || user.isBlocked) {
        return next(new AppError('User not found', 404));
    }

    // Create the comment
    const mycomment = await Comment.create({
        content: comment,
        author: req.user.id,
        blog: blogId,
        blogAuthor: commentToBlog.author
    });

    // Check if the comment was created successfully
    if (!mycomment) {
        return next(new AppError("Comment can't be created. Please try again later...", 500));
    }

    // Push the comment to the blog's comments array
    commentToBlog.comments.push(mycomment._id);

    // Save the comment and the blog
    await mycomment.save();
    await commentToBlog.save();

    // Send success response
    res.status(201).json({
        success: true,
        message: "Commented Successfully"
    });
});


/** 
 * @UpdateComments
 * @Route {{server}}/comments/:commentId
 * @Method put
 * @Access private(only logged in authorized user)
 * @ReqData commentId, comment
 */

export const editComment = asyncHandler(async function (req, res, next) {
    const { commentId } = req.params;
    const { comment } = req.body;

    // Check if commentId or comment is missing
    if (!commentId || !comment) {
        return next(new AppError("Comment is missing", 400));
    }

    // Find the comment and its owner
    const commentData = await Comment.findById(commentId);

    // Check if comment exists and if the user is the owner of the comment
    if (!commentData || (req.user.id !== commentData.author.toString() && req.user.role !== "admin")) {
        return next(new AppError("Your comment not found", 403))
    }

    // Find the user associated with the request
    const user = await User.findById(commentData.blogAuthor);

    // Checking user status
    if (!user || !user.isVerified || user.isClosed || user.isBlocked) {
        return next(new AppError('Comment not found', 404));
    }

    // Update the comment directly using commentData
    commentData.content = comment;
    await commentData.save();

    // Send success response
    res.status(200).json({
        success: true,
        message: "Comment Updated"
    });
});


/** 
 * @DeleteComment
 * @Route {{server}}/comments/:commentId
 * @Method delete
 * @Access private(only logged in authorized user)
 * @ReqData commentId
 */

export const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        // Find the comment and check if it exists
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return next(new AppError('Comment not found', 404));
        }

        // Check if the user is authorized to delete the comment
        if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
            return next(new AppError('You are not authorized to delete this comment', 403));
        }

        // Delete the comment and remove its reference from the associated blog
        await Promise.all([
            comment.deleteOne(),
            Blog.updateOne(
                { _id: comment.blog },
                { $pull: { comments: commentId } }
            )
        ]);

        // Response for comment
        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return next(new AppError('Something went wrong, please try again later', 500));
    }
};

export const fetchComment = async (req, res, next) => {
    try {
        const {blogId} = req.params;
        // Checking if the post exist;
        const blog = await Blog.findOne({_id: blogId, isPublished: true});
        if(!blog) return next(new AppError("Blog post not found.", 404))
        // Fetch the comments for the post
        const comments = await Comment.aggregate([
            { $match: { blog: mongoose.Types.ObjectId.createFromHexString(blogId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'commentAuthor',
                },
            },
            { $addFields: { commentAuthor: { $arrayElemAt: ['$commentAuthor', 0] } } },
            { $sort: {createdAt : -1}},
            {
                $project: {
                    _id: 1,
                    content: 1,
                    createdAt: 1,
                    'commentAuthor.fullName': { $concat: ['$commentAuthor.firstName', ' ', '$commentAuthor.lastName'] },
                    'commentAuthor.username': '$commentAuthor.username',
                    'commentAuthor.image': '$commentAuthor.avatar',
                },
            },
        ]);
        res.json({
            success: true,
            message: "Comments fetched successfully",
            comments: comments ? comments : [] // If no comments, return an empty array

        })
    } catch (error) {
        return next(new AppError('Comments could not be fetched properly.', 500));
    }
}


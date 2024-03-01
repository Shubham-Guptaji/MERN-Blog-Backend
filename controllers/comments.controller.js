import asyncHandler from "../middlewares/async.middleware.js";
import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";

/** 
 * @Comments
 * @Route {{URL}}/api/v1/comments
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

    // Find the user associated with the request
    const user = await User.findById(req.user.id);

    // Checking user status
    if (!user || !user.isVerified || user.isClosed || user.isBlocked) {
        return next(new AppError('Not authorized to comment.', 403));
    }

    // Find the blog to which the comment will be added
    const commentToBlog = await Blog.findById(blogId);

    // Check if the blog exists
    if (!commentToBlog) {
        return next(new AppError("BlogId is invalid", 404))
    }

    // Create the comment
    const mycomment = await Comment.create({
        content: comment,
        author: req.user.id,
        blog: blogId
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
 * @Route {{URL}}/api/v1/comments/
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
    if (!commentData || req.user.id !== commentData.author.toString()) {
        return next(new AppError("Not Authorized", 403))
    }

    // Find the user associated with the request
    const user = await User.findById(req.user.id);

    // Checking user status
    if (!user || !user.isVerified || user.isClosed || user.isBlocked) {
        return next(new AppError('Not authorized to update comment.', 403));
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
 * @Route {{URL}}/api/v1/comments/:commentId
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
        if (comment.author.toString() !== req.user.id) {
            return next(new AppError('You are not authorized to delete this comment', 403));
        }

        // Find the user associated with the request
        const user = await User.findById(req.user.id);

        // Checking user status
        if (!user || !user.isVerified || user.isClosed || user.isBlocked) {
            return next(new AppError('Not authorized to delete comment.', 403));
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


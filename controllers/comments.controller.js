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

export const CreateComment = asyncHandler(async function(req, res, next) {
    const {blogId, comment} = req.body;
    if(!blogId || !comment) {
        return next(new AppError("Comment and BlogId is required", 400));
    }
    const commentToBlog = await Blog.findById(blogId);
    if(!commentToBlog) {
        return next(new AppError("BlogId is invalid", 404))
    }
    const mycomment = await Comment.create({
        content : comment,
        author : req.user.id,
        blog : blogId
    })
    if(!mycomment) {
        return next(new AppError("Comment can't be created. Please try again later...",500));
    }
    commentToBlog.comments.push(mycomment._id);
    await mycomment.save();
    await commentToBlog.save();

    res.status(201).json({
        success: true,
        message: "Commented Successfully"
    })
})

/** 
 * @UpdateComments
 * @Route {{URL}}/api/v1/comments/
 * @Method put
 * @Access private(only logged in authorized user)
 * @ReqData commentId, comment
 */

export const editComment = asyncHandler(async function(req, res, next) {
    const {commentId} = req.params;
    if (!commentId || !req.body.comment) {
        return next(new AppError("Comment is missing", 400));
    }
    const commentowner = await Comment.findById(commentId);
    if(req.user.id != commentowner.author) {
        return next(new AppError("Not Authorized", 403))
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content : req.body.comment
            },
        },
        { 
            new: true, 
            runValidators: true 
        }
    )
    if(!comment) {
        return next(new AppError("Comment could not be updated", 500))
    }

    res.status(200).json({
        success: true,
        message: "Comment Updated"
    })
})

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
        
        const comment = await Comment.findById(commentId).select('blog author');

        if (!comment) {
            return next(new AppError('Comment not found', 404));
        }
        if (comment.author.toString() !== req.user.id) {
            console.log(author, "\n", req.user.id)
            return next(new AppError('You are not authorized to delete this comment', 403));
        }
        
        await comment.deleteOne();
        
        await Blog.updateOne(
            { _id: comment.blog },
            { $pull: { comments: commentId } }
        );

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return next(new AppError('Something went wrong, please try again later', 500));
    }
};

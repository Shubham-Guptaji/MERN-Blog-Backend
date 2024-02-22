import mongoose from 'mongoose';
import asyncHandler from "../middlewares/async.middleware.js";
import Blog from "../models/blog.model.js";
import Comment from '../models/comment.model.js';
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import fs from 'fs/promises';
import cloudinary from 'cloudinary';


/**
 * @CreatePost
 * @Route {{URL}}/api/v1/blogs/blog
 * @Method post
 * @Access private( Logged in users only )
 * @ReqData title, content, tags, seoKeywords, metaDescription
 */

export const createBlog = asyncHandler(async function (req, res, next) {
    const { title, content, tags, seoKeywords, metaDescription } = req.body;

    if (!title || !content || !tags || !seoKeywords || !metaDescription) {
        return next(new AppError("All fields are mandatory", 400));
    }
    const newBlog = await Blog.create({
        title,
        content,
        author: req.user.id,
        isPublished: true,
        seoKeywords,
        metaDescription
    })

    const tagslist = JSON.parse(tags);

    if (tagslist.length) {
        for (let tag of tagslist) {
            console.log(tag)
            newBlog.tags.push(tag)
        }
    }

    if (!newBlog) {
        return next(new AppError("Blog could not be created", 500))
    }

    const userUpdate = await User.findByIdAndUpdate(req.user.id, { $push: { blogs: newBlog._id } });

    if (!userUpdate) {
        await Blog.findByIdAndDelete(newBlog._id);
        return next(new AppError("Blog could not be created. Try again later", 500));
    }

    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(
                req.file.path, {
                folder: 'blog/posts/postImage',
                resource_type: 'image',
            }
            )
            if (result) {
                newBlog.public_image.resource_id = result.public_id;
                newBlog.public_image.resource_url = result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`);

        } catch (error) {
            fs.rm(`uploads/${req.file.filename}`);
            return next(
                new AppError(
                    JSON.stringify(error) || 'File not uploaded, please try again',
                    400
                )
            );
        }
    }

    await newBlog.save();
    await userUpdate.save();

    res.status(201).json({
        success: true,
        message: "Blog Post Created successfully",
        newBlog
    })
})

/**
 * @HomePagePosts
 * @Route {{URL}}/api/v1/blogs/
 * @Method get
 * @Access public
 */

export const getHomeBlogs = asyncHandler(async function (req, res, next) {
    const trendingPosts = await Blog.find({ isPublished: true })
        .sort({ likes: -1 })
        .limit(6)

    const authors = await User.find({}, { _id: 1 })
        .sort({ followers: -1 })
        .limit(20);

    const authorIds = authors.map(author => author._id);

    const popularAuthorPosts = await Blog.find({ author: { $in: authorIds }, isPublished: true })
        .limit(20)

    if (!trendingPosts || !popularAuthorPosts) {
        return next(new AppError("Some Error Occurred", 500))
    }
    res.status(200).json({ success: true, message: "Posts fetched successfully", data: { trendingPosts, popularAuthorPosts } });
})

/**
 * @SearchPost
 * @Route {{URL}}/api/v1/blogs/tag
 * @Method post
 * @Access public( Logged in users only )
 * @ReqData tagsearch(search keyword)
 */

export const tagBlog = asyncHandler(async function (req, res, next) {
    const { tagsearch } = req.body;
    if (!tagsearch) {
        return next(new AppError("Tag is required to search post"))
    }

    const tagRegex = tagsearch

    const posts = await Blog.find({
        $or: [
            { tags: { $regex: tagRegex } },
            { title: { $regex: new RegExp(tagsearch, "i") } },
        ],
    });

    if (!posts.length) {
        return next(new AppError("Post not found with related search", 404))
    }

    res.status(200).json({
        success: true,
        message: "Searched posts fetched successfully",
        posts
    })
})

/**
 * @GetSpecificPost
 * @Route {{URL}}/api/v1/blogs/
 * @Method get
 * @Access public
 * @ReqData blogId
 */

export const getBlogpost = asyncHandler(async function (req, res, next) {
    const { blogid } = req.params;
    try {
        const objectId = mongoose.Types.ObjectId.createFromHexString(blogid);
        const postDetails = await Blog.aggregate([
            { $match: { _id: objectId, isPublished: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                } 
            },
            {
                $addFields: {
                    author: { $arrayElemAt: ['$author', 0] }
                }
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    createdAt: 1,
                    likes: 1,
                    author: {
                        fullName: { $concat: ['$author.firstName', ' ', '$author.lastName'] },
                        followersCount: { $size: '$author.followers' },
                        bio: '$author.bio',
                        avatar: '$author.avatar'
                    }
                }
            }
        ]);

        if (!postDetails || postDetails.length === 0) {
            return next(new AppError("Post not found", 404));
        }

        const comments = await Comment.aggregate([
            { $match: { blog: objectId } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'commentAuthor'
                }
            },
            {
                $addFields: {
                    commentAuthor: { $arrayElemAt: ['$commentAuthor', 0] }
                }
            },
            {
                $project: {
                    _id: 1,
                    content: 1,
                    createdAt: 1,
                    'commentAuthor.fullName': { $concat: ['$commentAuthor.firstName', ' ', '$commentAuthor.lastName'] }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Post fetched successfully",
            postDetails,
            comments
        });
    } catch (error) {
        console.error('Error fetching post details:', error);
        return next(new AppError("Invalid blog ID", 400));
    }
});


/**
 * @UpdatePost
 * @Route {{URL}}/api/v1/blogs/:id
 * @Method put
 * @Access private (only author and admin)
 * @ReqData blogId
 */

export const UpdatePost = asyncHandler(async function (req, res, next) {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if(blog._id.toString() != req.user.id) {
        return next(new AppError("Not authorized", 400))
    }

    const updatedpost = await Blog.findByIdAndUpdate(
        id,
        {
            $set: req.body,
        },
        {
            runValidators: true,
        }
    );

    if (!updatedpost) {
        return next(new AppError('Invalid course id or course not found.', 400));
    }

    res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        updatedpost
    });
})




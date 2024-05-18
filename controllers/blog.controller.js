import mongoose from 'mongoose';
import asyncHandler from "../middlewares/async.middleware.js";
import Blog from "../models/blog.model.js";
import Comment from '../models/comment.model.js';
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import fs from 'fs/promises';
import cloudinary from 'cloudinary';
import Resourcefile from '../models/resources.model.js';
import Like from '../models/like.model.js';

// array shuffle function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * @CreatePost
 * @Route {{server}}/blogs/create
 * @Method post
 * @Access private( Logged in users only ) 
 * @ReqData authorId, title, content, tags, seoKeywords, metaDescription, resources(ids in array)
 */

export const createBlog = asyncHandler(async function (req, res, next) {

    const { authorId } = req.body;

    // Authorization
    if (req.user.id !== authorId && req.user.role !== "admin") {
        if (req.file) fs.rm(req.file.path); // Remove temporary file if exists
        return next(new AppError('You do not have permission to perform this action', 403));
    }

    // Check if the user is present
    const user = await User.findById(authorId);

    if (!user) {
        if (req.file) fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError("User not found", 404));
    }

    // Extract required fields from request body
    const { title, content, tags, seoKeywords, metaDescription, url } = req.body;

    // Validate required fields
    if (!title || !content || !tags || !seoKeywords || !metaDescription || !req.file || !url) {
        if (req.file) fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError("All fields are mandatory including post image", 400));
    }

    // Check if URL already present or not
    const isBlogPresent = await Blog.findOne({ url });
    if (isBlogPresent) {
        if (req.file) fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError("URL already exist for another blog.", 400));
    }

    // Create a new blog post
    const newBlog = await Blog.create({
        title,
        content,
        author: authorId,
        isPublished: true,
        seoKeywords,
        metaDescription,
        url
    });

    // adding tags in post

    let tagslist;
    try {
        tagslist = JSON.parse(tags);
    } catch (error) {
        fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError('Invalid JSON format for tags', 400));
    }

    if (!Array.isArray(tagslist)) {
        fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError('Please provide valid tag data (array)', 400));
    } else if (tagslist.length > 15) {
        fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError('Please provide atmost 15 tags only.', 400));
    }
    newBlog.tags = tagslist;

    // Handle scenario if new blog post could not be created
    if (!newBlog) {
        fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError("Blog could not be created", 500))
    }


    // Add the new blog post to the user's list of blogs
    user.blogs.push(newBlog._id);

    // Handle file upload 
    try {
        // Upload file to cloud storage
        const result = await cloudinary.v2.uploader.upload(
            req.file.path, {
            folder: `blog/posts/${user.username}`,
            resource_type: 'image',
        }
        )
        // Update new blog post with uploaded file details
        if (result) {
            newBlog.public_image.resource_id = result.public_id;
            newBlog.public_image.resource_url = result.secure_url;
        }
        // Delete temporary file from server
        fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
        // Handle errors during file upload
        fs.rm(`uploads/${req.file.filename}`);
        return next(
            new AppError(
                JSON.stringify(error) || 'File not uploaded, please try again',
                400
            )
        );
    }

    // Save the new blog post and update the user
    await newBlog.save();
    await user.save();



    // Respond with success message and the new blog post
    res.status(201).json({
        success: true,
        message: "Blog Post Created successfully",
        newBlog
    });
});

/**
 * @UnPublishPost
 * @Route {{server}}/blogs/:id
 * @Method Patch
 * @Access private(author and admin)
 * @ReqData BlogId
 */

export const unPublishBlog = asyncHandler(async function (req, res, next) {
    const { id } = req.params;

    // Find the blog post
    const blog = await Blog.findById(id);

    // Check if the blog post exists and if the user is authorized to unpublish it
    if (!blog || (blog.author.toString() !== req.user.id && req.user.role !== 'admin')) {
        return next(new AppError(`Not authorized to unpublish this post`, 401));
    }

    // Update the blog post's published status
    blog.isPublished = false;
    await blog.save();

    res.status(200).json({
        success: true,
        message: 'Blog unpublished successfully',
    });
});

/**
* @PublishPost
* @Route {{server}}/blogs/publish/:id
* @Method Patch
* @Access private(author and admin)
* @ReqData BlogId
*/

export const PublishBlog = asyncHandler(async function (req, res, next) {
    const { id } = req.params;

    // Find the blog post
    const blog = await Blog.findById(id);

    // Check if the blog post exists and if the user is authorized to unpublish it
    if (!blog || (blog.author.toString() !== req.user.id && req.user.role !== 'admin')) {
        return next(new AppError(`Not authorized to publish this post`, 401));
    }

    // Update the blog post's published status
    blog.isPublished = true;
    await blog.save();

    res.status(200).json({
        success: true,
        message: 'Blog published successfully',
    });
});


/**
 * @HomePagePosts
 * @Route {{server}}/blogs/
 * @Method get
 * @Access public
 */

export const getHomeBlogs = asyncHandler(async function (req, res, next) {
    const [trendingPosts, authors] = await Promise.all([
        Blog.aggregate([
            {
                $match: { // Filter published posts
                    isPublished: true,
                },
            },
            {
                $lookup: { // Lookup author information
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                },
            },
            {
                $unwind: '$author', // Unwind the author array for filtering
            },
            {
                $match: { // Filter based on author status and exclude unmatched authors
                    $and: [
                        { 'author.isClosed': { $ne: true } }, // Filter out closed authors
                        { 'author.isBlocked': { $ne: true } }, // Filter out blocked authors
                    ],
                },
            },
            {
                $project: { // Project desired fields and exclude unnecessary data
                    _id: 1,
                    title: 1,
                    // content: 1,
                    author: {
                        _id: 1,
                        username: 1,
                        firstName: 1,
                        lastName: 1,
                        // bio: 1,
                        avatar: 1
                    },
                    tags: 1,
                    likes: 1,
                    // comments: 1,
                    // seoKeywords: 1,
                    metaDescription: 1,
                    public_image: 1,
                    url: 1
                },
            },
            {
                $sort: { likes: -1, createdAt: -1 }, // Sort by likes (descending)
            },
            {
                $limit: 6, // Limit to 6 documents
            },
        ]),
        User.find({ isClosed: false, isBlocked: false }, { _id: 1, username: 1, firstName: 1, lastName: 1, avatar: 1 })
            .sort({ followers: -1 })
            .limit(26)
    ]);

    // Guard against empty trendingPosts to prevent errors:
    if (!trendingPosts || trendingPosts.length === 0) {
        return res.status(200).json({ success: true, message: "No trending posts found." });
    }

    let authdata = {};
    authors.forEach((element) => authdata[element["_id"]] = element);

    const authorIds = authors.map(author => author._id);

    // Fetching popular author posts from authors who are neither closed nor blocked
    const popularAuthorPosts = await Blog.find({ author: { $in: authorIds }, isPublished: true })
        .sort({ createdAt: -1 })
        .select("_id title author tags likes metaDescription public_image url")
        .limit(26);

    // const popularAuthorPosts = await Blog.aggregate([
    //     { $match: { author: { $in: authorIds }, isPublished: true } },
    //     // { $sort: { author: 1, likes: -1, createdAt: -1 } }, // Sort by author and likes descending
    //     {
    //       $group: {
    //         _id: "$author",
    //         post: { $first: "$$ROOT" } // Get the first post for each author
    //       }
    //     },
    //     { $replaceRoot: { newRoot: "$post" } }, // Replace the root document with the post
    //     {
    //       $project: {
    //         _id: 1,
    //         title: 1,
    //         author: 1,
    //         tags: 1,
    //         likes: 1,
    //         metaDescription: 1,
    //         public_image: 1,
    //         url: 1
    //       }
    //     },
    //     { $limit: 26 } // Limit the total number of posts
    //   ]);


    if (!trendingPosts.length || !popularAuthorPosts.length) {
        return next(new AppError("Some Error Occurred", 500));
    }

    // Filter author posts that are not in popular posts
    const authorPosts = popularAuthorPosts.filter(post => !trendingPosts.some(trendingpost => trendingpost._id.equals(post._id)));

    authorPosts.forEach((element) => element["author"] = authdata[element["author"]]);

    // Map over the array of trending posts to get the trending keywords
    const keywords = trendingPosts.flatMap(post => post.tags ? post.tags.filter(tag => tag.trim()).map(tag => tag.toLowerCase()) : []);
    const topKeywords = shuffleArray(Array.from(new Set(keywords))).slice(0, Math.min(keywords.length, 15));
    res.status(200).json({ success: true, message: "Posts fetched successfully", data: { trendingPosts, authorPosts: authorPosts.slice(0, 20), topKeywords } });
});




/**
 * @SearchPost
 * @Route {{server}}/blogs/tag
 * @Method post
 * @Access public( Logged in users only )
 * @ReqData tagsearch(search keyword)
 */

export const tagBlog = asyncHandler(async function (req, res, next) {
    //  Get search keyword from req.body
    const { tagsearch } = req.body;
    const skip = Number(req.body.skip) || 0;
    const limit = 21;

    // Check if tagsearch is provided and is a non-empty string
    if (!tagsearch || typeof tagsearch !== 'string') {
        return next(new AppError("A Tag is required to search post"));
    }

    // Finding the blog with that specific tag
    const posts = await Blog.aggregate([
        {
            $match: {
                $and: [
                    {
                        $or: [
                            { tags: { $regex: tagsearch, $options: 'i' } },
                            { title: { $regex: new RegExp(tagsearch, "i") } },
                        ],
                    },
                    { isPublished: true },
                ],
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
            },
        },
        {
            $unwind: '$author', // Unwind the author array for filtering
        },
        {
            $match: {
                // Filter based on author status and exclude unmatched authors
                $and: [
                    { 'author.isClosed': { $ne: true } }, // Filter out closed authors
                    { 'author.isBlocked': { $ne: true } }, // Filter out blocked authors
                ],
            },
        },
        {
            $skip: skip
        },
        {
            $limit: limit // Limit to the 21 documents
        },
        // Preparing response
        {
            $project: {
                _id: "$_id",
                title: 1,
                content: 1,
                // createdAt: 1,
                author: {
                    _id: 1,
                    username: 1,
                    firstName: 1,
                    lastName: 1,
                    bio: 1,
                    avatar: 1
                },
                seoKeywords: 1,
                metaDescription: 1,
                public_image: 1,
                tags: 1,
                url: 1
            },
        },
    ]);

    // Checking if there are any posts found in the database with provided keyword
    if (!posts.length) {
        return next(new AppError("Post not found with related search", 404));
    }

    const keywords = posts.flatMap(post => post.tags ? post.tags.filter(tag => tag.trim()).map(tag => tag.toLowerCase()) : []);
    const topKeywords = shuffleArray(Array.from(new Set(keywords))).slice(0, Math.min(keywords.length, 15));

    // Sending response
    res.status(200).json({
        success: true,
        message: "Searched posts fetched successfully",
        areMore: posts.length > 20 ? true : false,
        posts,
        keywords: topKeywords
    });
});

/**
 * @GetSpecificPost
 * @Route {{server}}/blogs/:url
 * @Method post
 * @Access public
 * @ReqData id
 */

export const getBlogpost = asyncHandler(async function (req, res, next) {
    // Getting Id from the parameter
    const { url } = req.params;
    const { userId } = req.body;
    try {

        // Fetch the blog post details
        const postDetails = await Blog.aggregate([
            { $match: { url: url, isPublished: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                },
            },
            { $unwind: '$author' }, // Unwind the author array for filtering
            {
                $match: {
                    // Filter based on author status and exclude unmatched authors
                    $and: [
                        { 'author.isClosed': { $ne: true } }, // Filter out closed authors
                        { 'author.isBlocked': { $ne: true } }, // Filter out blocked authors
                    ],
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    content: 1,
                    createdAt: 1,
                    likes: 1,
                    author: {
                        _id: 1,
                        username: 1,
                        firstName: 1,
                        lastName: 1,
                        followers: 1,
                        avatar: 1,
                        bio: 1,
                    },
                    seoKeywords: 1,
                    metaDescription: 1,
                    public_image: 1,
                    tags: 1,
                    url: 1
                },
            },
        ]);

        // If no post found, send a 404 error
        if (!postDetails || postDetails.length === 0) {
            return next(new AppError("This Post not found", 404));
        }

        let isLiked = false;
        // fetch if already liked
        // const userId = mongoose.Types.ObjectId.createFromHexString(postDetails._id);
        let likeinfo = null;
        if(userId) likeinfo = await Like.findOne({ blog: postDetails[0]._id, user: userId });
        if (likeinfo) isLiked = true;

        // Fetch the 8 most recent posts before the current post
        const recentPosts = await Blog.find({ createdAt: { $lt: postDetails[0].createdAt }, isPublished: true })
            .sort({ createdAt: -1 })
            .limit(8)
            .select('_id url metaDescription public_image title');

        // Convert the id from hex string to ObjectId

        // Fetch the comments for the post
        // const comments = await Comment.aggregate([
        //     { $match: { blog: postDetails._id } },
        //     {
        //         $lookup: {
        //             from: 'users',
        //             localField: 'author',
        //             foreignField: '_id',
        //             as: 'commentAuthor',
        //         },
        //     },
        //     { $addFields: { commentAuthor: { $arrayElemAt: ['$commentAuthor', 0] } } },
        //     {
        //         $project: {
        //             _id: 1,
        //             content: 1,
        //             createdAt: 1,
        //             'commentAuthor.fullName': { $concat: ['$commentAuthor.firstName', ' ', '$commentAuthor.lastName'] },
        //         },
        //     },
        // ]);
        postDetails[0].isLiked = isLiked;
        // Send the response with post details and comments
        res.status(200).json({
            success: true,
            message: "Post fetched successfully",
            postDetails: postDetails[0],
            recentPosts
            // comments,
        });
    } catch (error) {
        return next(new AppError("Invalid blog ID", 400));
    }
});


/**
 * @UpdatePost
 * @Route {{URL}}/api/v1/blogs/:id
 * @Method put
 * @Access private (only author and admin)
 * @ReqData id, authorId
 */

export const UpdatePost = asyncHandler(async function (req, res, next) {
    // Getting post id from parameter
    const { id } = req.params;
    const { authorId } = req.body;

    // Authorization
    if (req.user.id !== authorId && req.user.role !== "admin") {
        if (req.file) fs.rm(req.file.path); // Remove temporary file if exists
        return next(new AppError('You do not have permission to perform this action', 403));
    }

    if (!(req.body.title || req.body.content || req.body.seoKeywords || req.body.metaDescription || req.body.tags || req.file)) {
        if (req.file) fs.rm(req.file.path); // Remove temporary file if exists
        return next(new AppError("Atleast one information for updation  is required.", 400));
    }
    // Find the blog post by ID
    const blog = await Blog.findById(id);
    if (!blog) return next(new AppError('Blog post not found', 404));

    // Find the user and check if the account is active
    const user = await User.findOne({ _id: authorId, isClosed: false, isBlocked: false });
    if (!user) {
        if (req.file) fs.rm(req.file.path); // Remove temporary file if exists
        return next(new AppError('User account is closed or blocked', 403));
    }

    // Check if the logged-in user is the author of the blog post
    if (blog.author.toString() !== authorId) {
        if (req.file) fs.rm(req.file.path); // Remove temporary file if exists
        return next(new AppError('Not authorized', 400));
    }

    // Update blog fields if provided in the request body
    if (req.body.title) blog.title = req.body.title;
    if (req.body.content) blog.content = req.body.content;
    if (req.body.seoKeywords) blog.seoKeywords = req.body.seoKeywords;
    if (req.body.metaDescription) blog.metaDescription = req.body.metaDescription;
    if (req.body.tags) {
        // Parse and update tags if provided
        try {
            blog.tags = JSON.parse(req.body.tags);
        } catch (error) {
            return next(new AppError('Invalid JSON format for tags', 400));
        }
    }

    // Handle file upload if a file is attached in the request
    if (req.file) {
        try {
            // Remove the old image from cloudinary
            if (blog.public_image.resource_id) {
                await cloudinary.v2.uploader.destroy(blog.public_image.resource_id);
            }
            // Upload the new image to cloudinary
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: `blog/posts/${req.user.username}`,
                resource_type: 'image',
            });
            // Update blog post with the new image details
            if (result) {
                blog.public_image.resource_id = result.public_id;
                blog.public_image.resource_url = result.secure_url;
            }
            fs.rm(req.file.path); // Remove temporary file after upload
        } catch (error) {
            fs.rm(req.file.path); // Remove temporary file in case of upload failure
            return next(new AppError(error.message || 'File upload failed', 400));
        }
    }

    // Save the updated blog post
    await blog.save();

    // Respond with success message and updated blog post
    res.status(200).json({
        success: true,
        message: 'Blog post updated successfully',
        blog
    });
});


/**
 * @DeletePost
 * @Route {{server}}/blogs/:id
 * @Method delete
 * @Access private (only author and admin)
 * @ReqData id, authorId
 */

export const DeletePost = asyncHandler(async function (req, res, next) {
    const { id } = req.params;
    const { authorId } = req.body;

    if (req.user.id !== authorId && req.user.role !== "admin") {
        return next(new AppError('You do not have permission to perform this action', 403));
    }

    const post = await Blog.findOne({ _id: id, author: authorId })

    // Check if the post exists
    if (!post) return next(new AppError("Your Post not found", 404));

    try {
        // Remove the resources and files related to the post from cloudinary
        if (post.public_image.resource_id) {
            await cloudinary.v2.uploader.destroy(post.public_image.resource_id);
        }
    } catch (error) {
        return next(new AppError("Error deleting post resources", 500));
    }

    // Delete the post from the database
    await Blog.findByIdAndDelete(id);
    await Comment.deleteMany({ blog: id });
    await Like.deleteMany({ blog: id });
    await Resourcefile.deleteMany({ blog: id });

    // Remove the post ID from the user's blogs array
    await User.findByIdAndUpdate(req.user.id, {
        $pull: { blogs: post._id }
    }).exec();

    // Respond with success message and post details
    res.status(200).json({
        success: true,
        message: 'Post deleted successfully'
    });
});

/**
 * @AllPosts
 * @Route {{server}}/blogs/posts?skip=0&limit=10
 * @Method get
 * @Access public
 * @ReqData skip 
 */

export const AllPosts = asyncHandler(async function (req, res, next) {
    try {
        // Extract skip and limit values from request or set default values
        const skip = Number(req.query.skip) || 0;
        const limit = 21;

        // Fetch all published blog posts with author information
        const posts = await Blog.aggregate([
            {
                $match: { isPublished: true } // Filter published posts
            },
            {
                $lookup: { // Lookup author information
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: '$author' // Unwind the author array for filtering
            },
            {
                $match: { // Filter based on author status
                    $and: [
                        { 'author.isClosed': { $ne: true } }, // Filter out closed authors
                        { 'author.isBlocked': { $ne: true } } // Filter out blocked authors
                    ]
                }
            },
            {
                $sort: { createdAt: -1 } // Sort posts by createdAt in descending order
            },
            {
                $skip: skip // Skip records based on skip value
            },
            {
                $limit: limit // Limit records based on limit value
            },
            {
                $project: { // Project desired fields and exclude unnecessary data
                    _id: 1,
                    title: 1,
                    // content: 1,
                    // createdAt: 1,
                    likes: 1,
                    author: {
                        _id: 1,
                        username: 1,
                        firstName: 1,
                        lastName: 1,
                        avatar: 1
                        // bio: 1
                    },
                    seoKeywords: 1,
                    metaDescription: 1,
                    public_image: 1,
                    tags: 1,
                    url: 1
                }
            }
        ]);

        const responsePosts = posts.slice(0, 20);
        // Map over the array of trending posts to get the trending keywords
        const keywords = responsePosts.flatMap(post => post.tags ? post.tags.filter(tag => tag.trim()).map(tag => tag.toLowerCase()) : []);
        const topKeywords = shuffleArray(Array.from(new Set(keywords))).slice(0, Math.min(keywords.length, 15));

        // Send the response with fetched posts
        res.status(200).json({
            success: true,
            message: "All posts fetched successfully",
            areMore: posts.length > 20 ? true : false,
            posts: responsePosts,
            keywords: topKeywords
        });
    } catch (error) {
        // Handle errors
        console.error("Error fetching posts:", error);
        return next(new AppError("An error occurred while fetching posts", 500));
    }
});







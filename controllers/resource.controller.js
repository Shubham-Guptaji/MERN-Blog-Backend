import asyncHandler from "../middlewares/async.middleware.js";
import Resourcefile from "../models/resources.model.js";
import AppError from "../utils/appError.js";
import cloudinary from "cloudinary";
import Blog from  "../models/blog.model.js";
import fs from "fs/promises";

/**
 * @CreatePost
 * @Route {{server}}/resource/
 * @Method post
 * @Access private( Logged in users only )
 * @ReqData file
 */

export const AddResource = asyncHandler(async function (req, res, next) {

    // Check if file is uploaded
    if (!req.file) return next(new AppError("No file uploaded", 400));

    // Upload resource to Cloudinary
    try {
        let result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: `blog/resource/${req.user.username}`
        });

        // If resource uploaded successfully
        if (!result) throw new Error('Failed to upload image');
        // Save resource to the database
        const newResource = await Resourcefile.create({
            user: req.user.id,
            resource: {
                resource_id: result.public_id,
                resource_url: result.secure_url
            }
        });

        // Save the new resource
        await newResource.save();

        // Remove uploaded file from the server
        await fs.unlink(`uploads/${req.file.filename}`);

        // Send success response with resource details
        res.status(201).json({
            success: true,
            message: "File Uploaded successfully",
            data: {
                id: newResource._id,
                resource_id: result.public_id,
                resource_url: result.secure_url
            }
        });
    } catch (err) {
        await fs.unlink(`uploads/${req.file.filename}`);
        return next(new AppError(`Server error occurred.`, 500));
    }
});

/**
 * @BlogResource
 * @Route {{server}}/resource/blog/:id
 * @Method post 
 * @Access Private (logged in users only)
 * @Param resources (as array containing id of resources), id (blog id)
 */

export const BlogResource = asyncHandler(async function (req, res, next) {
    try {
        const { id } = req.params;
    
        // Check if id and resources are given
        if(!id || !req.body.resources || !req.body.resources.length) {
            return next(new AppError("Blog id and resources id are mandatory", 400));
        }
    
        const newBlog = await Blog.findOne({_id: id, author: req.user.id});
    
        if(!newBlog) {
            return next(new AppError("Blog not found.", 404));
        }
    
        // Handling resources for the blog post
        let newResources;
        try {
            newResources = JSON.parse(req.body.resources);
        } catch(error) {
            return next(new AppError("Invalid JSON format for resources added", 400))
        }
    
        // Checking if resources are array
        if (!Array.isArray(newResources)){
            return next(new AppError("Resources should be provided as an array.", 400));
        }
    
        // Find all resources in a single query
        const resources = await Resourcefile.find({
            _id: { $in: newResources },
            user: req.user.id,
            blog: { $exists: false } // Filter out resources already associated with a blog
        });
    
        // Check if all resources belong to the user
        if (resources.length !== newResources.length) {
            return next(new AppError("Some resources are invalid or not authorized for adding to the blog.", 403));
        }
    
        // Update all resources to associate them with the new blog
        await Resourcefile.updateMany(
            { _id: { $in: newResources } },
            { $set: { blog: newBlog._id } }
        );
    
        // Sending response
        res.status(200).json({
            success: true,
            message: "Resources added to blog posts successfully."
        })
    } catch (error) {
        next(new AppError("Invalid resources id", 400));
    }   
});

/**
* @DeletePost
* @Route {{server}}/resource/:id
* @Method delete
* @Access private( Logged in users only)
* @Params id
*/
export const DeleteResource = asyncHandler(async function (req, res, next) {

    // Extract the resource ID from request parameters
    const { id } = req.params;

    // Find the resource by its ID and user ID
    const resource = await Resourcefile.findOne({
        _id: id,
        user: req.user.id
    });

    // If resource not found, return error
    if (!resource) {
        return next(new AppError("No resource found", 404));
    }

    // Delete the resource from Cloudinary and the database
    const cloudinaryDeletion = await cloudinary.v2.uploader.destroy(resource.resource.resource_id);
    const dbDeletion = await Resourcefile.findByIdAndDelete(id);

    // Wait for both deletion operations to complete
    await Promise.all([cloudinaryDeletion, dbDeletion]);

    // Send success response
    res.status(200).json({
        success: true,
        message: "File deleted successfully"
    });
});

/**
* @GetResource
* @Route {{server}}/resource/:id
* @Method Get
* @Access private( Logged in users only)
* @Params blogId as id, authorId and skip;
*/
export const GetResources = asyncHandler(async function (req, res, next) {
    // Extract the blog id and author id from the request parameters
    const { id } = req.params;
    const { authorId } = req.params;
    const skip = (req.query.skip) || 0;
    const limit = 21;
  
    // Check if the blog id and author id are provided
    if (!id || !authorId) {
      return next(new AppError("Please provide author Id and blog's id", 400));
    }
  
    // Find the first resource associated with the blog post and author
    const resourceOne = await Resourcefile.findOne({ blog: id, user: authorId });
  
    // If no resource is found, return an error
    if (!resourceOne) {
      return next(new AppError("Resources not exist", 404));
    }
  
    // Check if the user is the author of the blog post or an admin
    if (resourceOne.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new AppError("Not authorized", 403));
    }
  
    // Fetch the resources associated with the blog post
    const resources = await Resourcefile.find({ blog: id })
      .skip(skip)
      .limit(limit);
  
    // If no resources are found, return an error
    if (!resources) {
      return next(new AppError("The specified user does not have this resource", 404));
    }
  
    // Send the resources as a response
    res.status(200)
      .json({
        success: true,
        message: "Resources fetched successfully",
        areMore: resources.length > 20 ? true : false,
        data: resources,
      });
  });
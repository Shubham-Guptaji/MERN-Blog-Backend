import asyncHandler from "../middlewares/async.middleware.js";
import Resourcefile from "../models/resources.model.js";
import AppError from "../utils/appError.js";
import User from "../models/user.model.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

/**
 * @CreatePost
 * @Route {{URL}}/api/v1/resource/
 * @Method post
 * @Access private( Logged in users only )
 * @ReqData file
 */

export const AddResource = asyncHandler(async function (req, res, next) {
    // Check if file is uploaded
    if (!req.file) return next(new AppError("No file uploaded", 400));

    // Find the user associated with the request
    const user = await User.findById(req.user.id);

    // Checking user status
    if (!user || !user.isVerified || user.isClosed || user.isBlocked) {
        await fs.unlink(`uploads/${req.file.filename}`);
        return next(new AppError('Not authorized to delete this resource.', 403));
    }

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
        console.log(err);
        await fs.unlink(`uploads/${req.file.filename}`);
        return next(new AppError('Server error occurred.', 500));
    }
});

/**
* @DeletePost
* @Route {{URL}}/api/v1/resource/:id
* @Method delete
* @Access private( Logged in users only)
* @Params id
*/
export const DeleteResource = asyncHandler(async function (req, res, next) {
    // Extract the resource ID from request parameters
    const { id } = req.params;

    // Find the current user
    const user = await User.findById(req.user.id);

    // Check if user is authorized to delete the resource
    if (!user || !user.isVerified || user.isClosed || user.isBlocked) {
        return next(new AppError('Not authorized to delete this resource.', 403));
    }

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
    const cloudinaryDeletion = cloudinary.v2.uploader.destroy(resource.resource.resource_id);
    const dbDeletion = Resourcefile.findByIdAndDelete(id);

    // Wait for both deletion operations to complete
    await Promise.all([cloudinaryDeletion, dbDeletion]);

    // Send success response
    res.status(200).json({
        success: true,
        message: "File deleted successfully"
    });
});
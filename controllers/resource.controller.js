import asyncHandler from "../middlewares/async.middleware";
import Resourcefile from "../models/resources.model";
import AppError from "../utils/appError";
import cloudinary from "cloudinary";
import fs from "fs/promises";

/**
 * @CreatePost
 * @Route {{URL}}/api/v1/resource/
 * @Method post
 * @Access private( Logged in users only )
 * @ReqData file
 */

export const AddResource = asyncHandler(async function(req, res, next) {
    if( !req.file ) return next( new AppError("No file uploaded", 400));
    // upload resource to cloudinary and then delete from multer
    try{
        
        let result = await cloudinary.v2.uploader.upload( 
            req.file.path, {
            folder: `blog/resource/${req.user.username}`
            }
        );
        if (result) {

            //saving resource to the database;
            const newResource = await Resourcefile.create({
                user: req.user.id,
                resource: {
                    resource_id : result.public_id,
                    resource_url : result.secure_url
                }

            })
            await newResource.save();
        }
        fs.rm(`uploads/${req.file.filename}`);

        // send response
        res.status(201).json({
            success: true,
            message: "File Uploaded successfully",
            data: {
                resource_id : result.public_id,
                resource_url : result.secure_url
            }
        });
    }catch(err){
        console.log(err);
        return next(new AppError('Server error',500), err);
    }
    
})

/**
* @DeletePost
* @Route {{URL}}/api/v1/resource/:id
* @Method delete
* @Access private( Logged in users only)
* @Params id
*/
export const DeleteResource = asyncHandler(async function(req, res, next) {
   // find the resource by id
   const resource = await Resourcefile.findOne({
       where: {
           id: req.params.id,
           user: req.user.id
       }
   })

   if (!resource) return next(new AppError("No resource found", 404))

   // delete the resource from cloudinary
   await cloudinary.v2.uploader.destroy(resource.resource.resource_id)

   // delete the resource from the database
   await resource.destroy()

   // send response
   res.status(204).json({
       success: true,
       message: "File deleted successfully"
   })
})
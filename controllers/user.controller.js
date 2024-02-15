import AppError from "../utils/appError.js";
import User from "../models/user.model.js";
import path from 'path';
import sendEmail from "../utils/emailHandler.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import asyncHandler from "../middlewares/async.middleware.js";
import crypto from "crypto";

const cookieOptions = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 2 * 24 * 60 * 60 * 1000,
    httpOnly: true
}

/**
 * @CreateUser
 * @Route {{URL}}/api/v1/user/register
 * @Method post
 * @Access public
 * @ReqData username, email, firstName, lastName, password
*/
export const registerUser = asyncHandler(async function (req, res, next) {
    const { username, email, firstName, lastName, password } = req.body;
    if (!username || !email || !firstName || !lastName || !password) {
        return next(new AppError("All fields are mandatory.", 400));
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
        return next(new AppError("User Already registered.", 409));
    }
    const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        avatar: {
            public_id: email,
            secure_url:
                'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
        },
    });

    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(
                req.file.path, {
                folder: 'blog/user/avatar',
                resource_type: 'image',
                width: 350,
                height: 350,
                gravity: 'faces',
                crop: 'fill',
            }
            )
            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`);

        } catch (error) {
            console.log('not uploaded')
            for (const file of await fs.readdir('uploads/')) {
                if(file == '.gitkeep') continue
                await fs.unlink(path.join('uploads/', file));
            }
            return next(
                new AppError(
                    JSON.stringify(error) || 'File not uploaded, please try again',
                    400
                )
            );
        }
    }

    await user.save();
    const token = await user.generateJWTToken();
    user.password = undefined;
    res.cookie('token', token, cookieOptions);
    res.status(201).json({
        success: true,
        message: "User created Successfully",
        user: {
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role
        }
    })
})

/**
 * @LoginUser
 * @Route {{URL}}/api/v1/user/login
 * @Method post
 * @Access public
 * @ReqData username, password
*/

export const loginUser = asyncHandler(async function (req, res, next) {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new AppError("Username and Password is mandatory", 400))
    }

    const user = await User.findOne({ username: username.toLowerCase() }).select("+password");

    if (!(user && (await user.comparePassword(password)))) {
        return next(
            new AppError('Email or Password do not match or user does not exist', 401)
        );
    }

    const token = await user.generateJWTToken();

    delete user.password;

    res.cookie("token", token, cookieOptions);
    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role,
            isVerified: user.isVerified,
            isClosed: user.isClosed,
            isBlocked: user.isBlocked
        }
    })
})

/**
 * @LogOut
 * @Route {{URL}}/api/v1/user/logout
 * @Method post
 * @Access private( Logged In users only )
 */

export const userLogOut = asyncHandler(async function (req, res, next) {

    res.cookie("token", null, {
        secure: process.env.NODE_ENV === 'production' ? true : false,
        maxAge: 0,
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "User logged Out successfully"
    });

})


/**
 * @ForgotPassword
 * @Route {{URL}}/api/v1/user/forgotpassword
 * @Method post
 * @Access public
 * @ReqData email
*/

export const forgotPassword = asyncHandler(async function (req, res, next) {
    const { email } = req.body;
    if (!email) {
        return next(new AppError('Email is required', 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('Email not registered', 400));
    }
    const resetToken = await user.generatePasswordResetToken();
    await user.save();
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

    try {
        await sendEmail(email, subject, message);
        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully`,
        });
    } catch (error) {
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        return next(
            new AppError(
                error.message || 'Something went wrong, please try again.',
                500
            )
        );
    }
})

/**
 * @ResetPassword
 * @Route {{URL}}/api/v1/user/reset/:id
 * @Method post
 * @Access public
 * @ReqData resettoken in param and password
*/

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    if (!password) {
        return next(new AppError('Password is required', 400));
    }


    const user = await User.findOne({
        resetToken: forgotPasswordToken,
        resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return next(
            new AppError('Token is invalid or expired, please try again', 400)
        );
    }

    user.password = password;
    user.resetTokenExpiry = 0;
    user.resetToken = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
    });
});


/**
 * @ChangePassword
 * @Route {{URL}}/api/v1/user/change-password
 * @Method post
 * @Access private( Logged in users only )
 * @ReqData oldPassword, newPassword
 */

export const changePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;
    
    if (!oldPassword || !newPassword) {
      return next(
        new AppError('Old password and new password are required', 400)
      );
    }
    
    const user = await User.findById(id).select('+password');
    
    if (!user) {
      return next(new AppError('Invalid user id or user does not exist', 400));
    }
    
    const isPasswordValid = await user.comparePassword(oldPassword);
    
    if (!isPasswordValid) {
      return next(new AppError('Invalid old password', 400));
    }
    
    user.password = newPassword;
    await user.save();
    
    user.password = undefined;
  
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  });

/**
 * @UserProfile
 * @Route {{URL}}/api/v1/user/profile/:username
 * @Method get
 * @Access private( Logged in users only )
 * @ReqData username
 */

export const userProfile = asyncHandler(async function (req, res, next) {
    const { username } = req.params;

    const userDetails = await User.aggregate([
        { $match: { username } },
        {
          $lookup: {
            from: 'users',
            localField: 'followers',
            foreignField: '_id',
            as: 'followers'
          }
        },
        {
          $addFields: {
            totalFollowers: { $size: '$followers' }
          }
        },
        {
          $lookup: {
            from: 'blogs',
            localField: '_id',
            foreignField: 'author',
            as: 'blogPosts'
          }
        },
        {
          $project: {
            username: 1,
            email: 1,
            firstName: 1,
            lastName: 1,
            bio: 1,
            avatar: 1,
            role: 1,
            createdAt: 1,
            totalFollowers: 1,
            blogPosts: { $slice: ['$blogPosts', 20] },
            isBlocked: 1,
            isClosed: 1,
            isVerified: 1
          }
        }
      ]);
  
      if (userDetails.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
    let isAuthor = false;

    if(req.user.username === username) isAuthor = true;

    res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        isAuthor,
        userDetails : userDetails[0]
    })

})

 
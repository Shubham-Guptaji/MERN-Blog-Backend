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
                if (file == '.gitkeep') continue
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

    if (req.user.username === username) isAuthor = true;

    res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        isAuthor,
        userDetails: userDetails[0]
    })

})

/**
 * @BlockUser
 * @Route {{URL}}/api/v1/user/profile/:username/block
 * @Method patch
 * @Access private( Only admin )
 * @ReqData username
 */

export const blockUser = asyncHandler(async function (req, res, next) {
    if (req.user.role != "admin") {
        return next(new AppError("Unauthorized request", 401));
    }
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
        return next(new AppError("User not found.", 404));
    }
    user.isBlocked = true;
    await user.save();

    res.status(200).json({
        success: true,
        message: "The account has been blocked."
    })
})

/**
 * @UnBlockUser
 * @Route {{URL}}/api/v1/user/profile/:username/unblock
 * @Method patch
 * @Access private( Only admin )
 * @ReqData username
 */

export const unBlockUser = asyncHandler(async function (req, res, next) {
    if (req.user.role != "admin") {
        return next(new AppError("Unauthorized request", 401));
    }
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
        return next(new AppError("User not found.", 404));
    }
    user.isBlocked = false;
    await user.save();

    res.status(200).json({
        success: true,
        message: "The account has been unblocked."
    })
})

/**
 * @CloseAccount
 * @Route {{URL}}/api/v1/user/profile/:username/close
 * @Method patch
 * @Access private( Only admin and user )
 * @ReqData username
 */

export const CloseAccount = asyncHandler(async function (req, res, next) {
    const { username } = req.params;
    if (!username) {
        return next(new AppError("Please provide username.", 400));
    }
    let user = await User.findOne({ username }).select('-password');
    if (!user) {
        return next(new AppError("Username is invalid", 404));
    }
    if (req.user.role == 'user' && req.user.username !== username) {
        return next(new AppError("You don't have permission to perform this action on another user's profile.", 403))
    }
    user.isClosed = true;
    await user.save();

    const subject = "Your Account has been closed.";
    const message = `<html><head><style>body { font-family: Arial, sans-serif; } .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; } .title { font-size: 24px; margin-bottom: 20px; } .message { font-size: 16px; margin-bottom: 20px; } .link { color: #007bff; text-decoration: none; } .link:hover { text-decoration: underline; }</style></head><body><div class="container"><div class="title">Account Closure Confirmation</div><div class="message">Dear ${user.name},<br><br>We regret to inform you that your account on Alcodemy Blog has been closed as per your request. We are sorry to see you go and hope that you had a positive experience with us.<br><br>If you have any questions or concerns, please don't hesitate to contact us at [support@alcodemy.com](mailto:support@alcodemy.com).<br><br>Best regards,<br>The Alcodemy Blog Team</div></div></body></html>`;
    await sendEmail({ email: user.email, subject, message });

    res.cookie("token", null, {
        secure: process.env.NODE_ENV === 'production' ? true : false,
        maxAge: 0,
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Account closed successfully"
    })

})

/**
 * @GenerateVerifyToken
 * @Route {{URL}}/api/v1/user/verify/
 * @Method post
 * @Access private( Only logged in user )
 * @ReqData userid
 */

export const VerifyTokenEmail = asyncHandler(async function (req, res, next) {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError("User not found!", 404));
    }

    const emailtoken = user.generateVerifyToken();

    await user.save();
    const verifyAccountUrl = `${process.env.FRONTEND_URL}/api/v1/user/profile/:${user.username}/verify/${emailtoken}`;
    const subject = 'Verify account in Alcodemy Blog';
    const message = `
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }

                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 5px;
                }

                .title {
                    font-size: 24px;
                    margin-bottom: 20px;
                }

                .message {
                    font-size: 16px;
                    margin-bottom: 20px;
                }

                .link {
                    color: #007bff;
                    text-decoration: none;
                }

                .link:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="title">Verify Account</div>
                <div class="message">You can verify your password by clicking <a href="${verifyAccountUrl}" target="_blank" class="link">Verify your account</a></div>
                <div class="message">If the above link does not work for some reason then copy paste this link in a new tab: ${verifyAccountUrl}</div>
            </div>
        </body>
    </html>
`;

    try {
        await sendEmail(user.email, subject, message);
        res.status(200).json({
            success: true,
            message: `Verify token has been sent to ${email} successfully`,
        });
    } catch (error) {
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;

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
 * @VerifyAccount
 * @Route {{URL}}/api/v1/user/profile/:username/verify/:token
 * @Method patch
 * @Access public ( AnyOne )
 * @ReqData token
 */

export const VerifyAccount = asyncHandler(async function (req, res, next) {
    let username = req.params.username;
    let verifyToken = req.params.token;
    let user = await User.findOne({
        username,
        verifyToken: verifyToken,
        verifyTokenExpiry: { $gt: Date.now() },
    }).select('-password');

    if (!user) {
        return next(new AppError("Invalid Token", 404));
    }
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = 0;

    res.status(200).json({
        success: true,
        message: "Account Verified Successfully"
    })

})

/**
* @UpdateProfile
* @Route {{URL}}/api/v1/user/profile
* @Method patch
* @Access private( Logged in users only)
* @ReqData username, firstName, lastName, bio, avatar (optional)
*/

export const updateProfile = asyncHandler(async function (req, res, next) {
    const { username, firstName, lastName, bio, avatar } = req.body;
    const { id } = req.user;

    if (!username && !firstName && !lastName && !bio && !avatar) {
        return next(new AppError('At least one field is required for update.', 400));
    }

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError('Invalid user id or user does not exist', 400));
    }

    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;

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
                if (file == '.gitkeep') continue
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

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user
    })
});



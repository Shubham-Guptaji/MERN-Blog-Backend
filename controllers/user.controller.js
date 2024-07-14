import AppError from "../utils/appError.js";
import User from "../models/user.model.js";
import path from "path";
import sendEmail from "../utils/emailHandler.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import asyncHandler from "../middlewares/async.middleware.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Like from "../models/like.model.js";
import Follower from "../models/follower.model.js";
import Blog from "../models/blog.model.js";
import Comment from "../models/comment.model.js";
import Resourcefile from "../models/resources.model.js";
import mongoose from "mongoose";

const CookieOptions = {
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
};

// Token generator function for controllers

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (user.isClosed) {
            throw new AppError("This account is closed. Please Login again to reopen the account", 403)
        }
        if (user.isBlocked) {
            throw new AppError("This account has been blocked", 403)
        }

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, refreshToken };
    } catch (error) {
        throw new AppError(error?.message || "Something went wront while generating tokens", error?.status || 500);
    }
}

const getWeeklyPartitions = (numberOfWeeks = 8) => {
    const today = new Date();
    const weeks = [];
    // Calculate start date for the last 7 weeks (considering today)
    const startOfWeek = new Date(today);
    // startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1 - numberOfWeeks * 7);
    // startOfWeek.setDate(today.getDate() - (today.getDay() || 7) - numberOfWeeks * 7);
    startOfWeek.setDate(today.getDate() - (today.getDay() || 6) - (numberOfWeeks * 7) - 1);
    while (startOfWeek < today) {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        weeks.push({ start: new Date(startOfWeek), end: new Date(endOfWeek) });

        startOfWeek.setDate(startOfWeek.getDate() + 7);
    }
    return weeks;
}



/**
 * @CreateUser
 * @Route {{server}}/user/register
 * @Method post
 * @Access public
 * @ReqData username, email, firstName, lastName, password
 */
export const registerUser = asyncHandler(async function (req, res, next) {
    // Destructure the request body to get the user details
    const { username, email, firstName, lastName, password } = req.body;

    // Check if all the required fields are provided
    if (!username || !email || !firstName || !lastName || !password || !req.file) {
        if (req.file) fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError("All fields are mandatory.", 400));
    }

    // Regular expression to match password criteria
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]:;<>?,./\\-]).{8,}$/;

    // Test if the password matches the criteria
    if (!passwordRegex.test(password)) {
        if (req.file) fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError('Password should contain atleast 8 characters, small letters, capital letters and symbols', 400));
    }

    // Check if a user with the provided email already exists
    const userExist = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    });

    if (userExist) {
        if (req.file) fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError("User Already registered.", 409));
    }

    try {
        // Create a new user with the provided details
        const user = await User.create({
            username,
            email,
            password,
            firstName,
            lastName,
            avatar: {
                public_id: email,
                secure_url:
                    "https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg",
            },
        });

        // If a file is uploaded, upload it to cloudinary and update the user's avatar
        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "blog/user/avatar",
                    resource_type: "image",
                    width: 350,
                    height: 350,
                    gravity: "faces",
                    crop: "fill",
                });
                if (result) {
                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;
                }
                fs.rm(`uploads/${req.file.filename}`);
            } catch (error) {
                for (const file of await fs.readdir("uploads/")) {
                    if (file == ".gitkeep") continue;
                    await fs.unlink(path.join("uploads/", file));
                }
                return next(
                    new AppError(
                        JSON.stringify(error) || "File not uploaded, please try again",
                        400
                    )
                );
            }
        }

        // Save the updated user to the database
        await user.save();

        // Define the email subject and message
        const subject = `Welcome to Alcodemy Blog`;
        const message = `<h2>Alcodemy Blog</h2><p>Hi ${user.firstName}, <br> Thanks for joining our team of Great Bloggers.</p>`;
        const userEmail = user.email;
        // Send the email to the user
        sendEmail(userEmail, subject, message);

        // Generate a token for the logged-in user
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        // Send a success response with the user's details
        res
            .status(201)
            .cookie("accessToken", accessToken, CookieOptions)
            .cookie("refreshToken", refreshToken, CookieOptions)
            .json({
                success: true,
                message: "User created Successfully",
                user: {
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    bio: user.bio,
                    avatar: user.avatar,
                    role: user.role,
                    tokens: { accessToken, refreshToken }
                }
            });
    } catch (error) {
        if (req.file) fs.rm(`uploads/${req.file.filename}`);
        return next(new AppError(error.message, 400));
    }
});

/**
 * @LoginUser
 * @Route {{server}}/user/login
 * @Method post
 * @Access public
 * @ReqData username, password
 */

export const loginUser = asyncHandler(async function (req, res, next) {
    // Destructure the request body to get the login details
    const { username, password } = req.body;

    // Checking if the username and password exist
    if (!username || !password) {
        return next(new AppError("Username and Password is mandatory", 400));
    }

    // Finding the User in Database by username and if found then compare password
    const user = await User.findOne({ username: username.toLowerCase() }).select("+password");

    if (!(user && (await user.comparePassword(password)))) {
        return next(
            new AppError("Username or Password do not match or user does not exist", 401)
        );
    }

    // Checking if the user has been blocked by admin
    if (user.isBlocked) {
        return next(
            new AppError(`Your account has been blocked. Please contact support`, 403)
        );
    }

    // Checking if the user's account is closed, then open it again
    if (user.isClosed) {
        user.isClosed = false;
        await user.save();
        user.info = "Account reopened successfully.";
    }

    // Generate a token for the logged-in user
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Sending the response with cookies
    res
        .status(200)
        .cookie("accessToken", accessToken, CookieOptions)
        .cookie("refreshToken", refreshToken, CookieOptions)
        .json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                bio: user.bio,
                avatar: user.avatar,
                role: user.role,
                isVerified: user.isVerified,
                tokens: { accessToken, refreshToken }
            },
        });
});

/**
 * @LogOut
 * @Route {{server}}/user/logout
 * @Method post
 * @Access private( Logged In users only )
 */

export const userLogOut = asyncHandler(async function (req, res, next) {
    // Get the logged-in user from the database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        }
    )

    // Sending back empty cookie
    const cookieOptions = {
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: 0,
        httpOnly: true,
    }

    // Sending back response data
    res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json({
            success: true,
            message: "User logged Out successfully",
        });
});

/**
 * @GenerateNewToken
 * @Route {{server}}/user/refresh-token
 * @Method post
 * @Access private( Logged In users only )
 * @ReqData refreshToken
 */

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
    // Destructuring request to get refreshToken
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    // Checking if refreshToken found
    if (!incomingRefreshToken) {
        return next(new AppError("Refresh Token not found.", 401));
    }

    try {
        // Verifying token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        // Checking if token found valid or not 
        if (!decodedToken) return next(new AppError("Invalid token", 401));

        // Verifying the user from database and getting token information (will implement only if quantity of users becomes very high.)

        // const user = await User.findById(decodedToken?._id);

        // if (!user) {
        //     return next(new AppError("Invalid refresh token", 401));
        // }

        // if (incomingRefreshToken !== user?.refreshToken) {
        //     throw new AppError("Refresh token is expired or used", 401)

        // }

        // Generating tokens 
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(decodedToken.id);


        // Finding the User in Database by username and if found then compare password
        const user = await User.findById(decodedToken.id);

        // Checking if the user has been blocked by admin
        if (user.isBlocked) {
            return next(
                new AppError(`Your account has been blocked. Please contact support`, 403)
            );
        }

        // Checking if the user's account is closed, then open it again
        if (user.isClosed) {
            user.isClosed = false;
            await user.save();
            user.info = "Account reopened successfully.";
        }

        // Returning the response
        return res
            .status(200)
            .cookie("accessToken", accessToken, CookieOptions)
            .cookie("refreshToken", refreshToken, CookieOptions)
            .json({
                success: true,
                message: "Token fetched successfully",
                // tokens: { accessToken, refreshToken }
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    bio: user.bio,
                    avatar: user.avatar,
                    role: user.role,
                    isVerified: user.isVerified,
                    tokens: { accessToken, refreshToken }
                },
            })
    } catch (error) {
        return next(new AppError(error?.message || "Server Error", 401));
    }

})

/**
 * @ForgotPassword
 * @Route {{server}}/user/forgot-password
 * @Method post
 * @Access public
 * @ReqData email
 */

export const forgotPassword = asyncHandler(async function (req, res, next) {
    const { email, username } = req.body;

    // Check if email is provided
    if (!(email || username)) {
        return next(new AppError("Without Username or Email password can not be changed.", 400));
    }

    // Find user by email
    const user = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    });

    // If user is not found, return error
    if (!user) {
        return next(new AppError("Your account not found.", 404));
    }

    // Checking if the user has been blocked by admin
    if (user.isBlocked) {
        return next(
            new AppError(`Your account has been blocked. Please contact support`, 403)
        );
    }

    // Generate password reset token for user
    const resetToken = await user.generatePasswordResetToken();

    // Save updated user with reset token and expiry time
    await user.save();

    // Create reset password URL
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Create email subject and message
    const subject = "Reset Password";
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>.<br/><br/>If the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}<br/><br/> This link is valid only for 15 minutes.<br/>If you have not requested this, kindly ignore.`;

    try {
        // Send password reset email
        await sendEmail(user.email, subject, message);
        res.status(200).json({
            success: true,
            message: `Password Reset link has been sent to Your registered email successfully`,
        });
    } catch (error) {
        // If error occurs while sending email, undo reset token and expiry time
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        return next(
            new AppError(
                error.message || "Something went wrong, please try again.",
                500
            )
        );
    }
});

/**
 * @ResetPassword
 * @Route {{server}}/user/reset/:id
 * @Method post
 * @Access public
 * @ReqData resettoken in param and password
 */

export const resetPassword = asyncHandler(async function (req, res, next) {
    // Destructuring request to get the resetToken and password
    const { resetToken } = req.params;
    const { password } = req.body;

    // Validate password field
    if (!password) {
        return next(new AppError("Password is required", 400));
    }

    // Regular expression to match password criteria
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]:;<>?,./\\-]).{8,}$/;

    // Test if the password matches the criteria
    if (!passwordRegex.test(password)) {
        return next(new AppError('Password should contain atleast 8 characters, small letter, capital letter and symbol', 400));
    }

    // Generate hash from the provided reset token
    const forgotPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Find user with matching reset token and non-expired reset token expiry
    const user = await User.findOne({
        resetToken: forgotPasswordToken,
        resetTokenExpiry: { $gt: Date.now() },
    });

    // Check if user exists
    if (!user) {
        return next(
            new AppError("Token is invalid or expired, please try again", 400)
        );
    }

    // Check if user is blocked
    if (user.isBlocked) {
        return next(
            new AppError(`Your account has been blocked. Please contact support`, 403)
        );
    }

    // Update user's password, reset token, and reset token expiry
    user.password = password;
    user.resetTokenExpiry = 0;
    user.resetToken = undefined;

    await user.save();

    // Send success response
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});

/**
 * @ChangePassword
 * @Route {{server}}/user/change-password
 * @Method post
 * @Access private( Logged in users only )
 * @ReqData oldPassword, newPassword
 */

export const changePassword = asyncHandler(async function (req, res, next) {
    // Destructure the request body to get the old and new passwords
    const { oldPassword, newPassword } = req.body;

    const { id } = req.user; // Get the user's id from the JWT payload

    // Check if both old and new passwords are provided
    if (!oldPassword || !newPassword) {
        return next(
            new AppError("Old password and new password are required", 400)
        );
    }

    // Check if the new password is the same as the old password
    if (oldPassword === newPassword) {
        return next(
            new AppError("New Password can not be the same as Old Password", 400)
        );
    }

    // Regular expression to match password criteria
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]:;<>?,./\\-]).{8,}$/;

    // Test if the password matches the criteria
    if (!passwordRegex.test(newPassword)) {
        return next(new AppError('Password should contain atleast 8 characters, small letter, capital letter and symbol', 400));
    }

    // Find the user by id and select the password field
    const user = await User.findById(id).select("+password");

    // Check if the user exists
    if (!user) {
        return next(new AppError("Invalid user id or user does not exist", 400));
    }

    // Compare the old password with the user's password in the database
    const isPasswordValid = await user.comparePassword(oldPassword);

    // Check if the old password is correct
    if (!isPasswordValid) {
        return next(new AppError("Invalid old password", 400));
    }

    // Update the user's password in the database
    user.password = newPassword;
    await user.save();

    // Remove the password field from the user object before sending it as a response
    user.password = undefined;

    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});

/**
 * @UserProfile
 * @Route {{server}}/user/profile/:username
 * @Method get
 * @Access private( Logged in users only )
 * @ReqData username
 */

export const userProfile = asyncHandler(async function (req, res, next) {
    // Get the username from the request parameters
    const { username } = req.params;
    const skip = Number(req.body.skip) || 0;
    const limit = 21;

    // Define aggregation pipeline stages
    const pipeline = [
        {
            $match: { username }
        },
        {
            $lookup: {
                from: "blogs",
                localField: "_id",
                foreignField: "author",
                as: "blogPosts",
            },
        },
        {
            $addFields: {
                totalPosts: { $size: "$blogPosts" },
            },
        },
    ];

    // If the requesting user is not the same as the requested user and not an admin, filter unpublished posts

    pipeline.push(
        {
            $set: {
                publishedPosts: {
                    $filter: {
                        input: "$blogPosts",
                        as: "mypost",
                        cond: { $eq: ["$$mypost.isPublished", true] }
                    }
                }
            }
        },
        {
            $set: {
                postPublished: {
                    $size: "$publishedPosts"
                }
            }
        }
    );


    if (req.user.username !== username && req.user.role !== "admin") {
        pipeline.push(
            {
                $set: {
                    blogPosts: {
                        $filter: {
                            input: "$blogPosts",
                            as: "post",
                            cond: { $eq: ["$$post.isPublished", true] }
                        }
                    }
                }
            },
            {
                $set: {
                    totalPosts: {
                        $size: "$blogPosts"
                    }
                }
            }
        );
    }

    // Add projection stage to limit the number of returned posts to 20
    pipeline.push(
        {
            $set: {
                blogPosts: {
                    $sortArray: {
                        input: "$blogPosts",
                        sortBy: { createdAt: -1 }
                    }
                }
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
                isClosed: 1,
                isBlocked: 1,
                postPublished: 1,
                createdAt: 1,
                followers: 1,
                following: 1,
                likes: 1,
                bgImage: 1,
                comments: 1,
                isVerified: 1,
                blogPosts: { $slice: ["$blogPosts", skip, limit] },
                totalPosts: 1,
                totalBlogs: { $size: "$blogs" }
            },
        }
    );

    // Execute aggregation pipeline
    const userDetails = await User.aggregate(pipeline);
    // If the user was not found, return a 404 error
    if (userDetails.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has been verified
    if (!userDetails[0].isVerified && req.user.role === "user" && req.user.username !== username) {
        return next(new AppError(`User not found`, 403));
    }

    // Check if the user has been blocked by the admin
    if (userDetails[0].isBlocked && req.user.role === "user") {
        return next(new AppError(`User not found`, 403));
    }

    // Check if the account is closed
    if (userDetails[0].isClosed && req.user.role === "user") {
        return next(new AppError(`User not found`, 403));
    }

    // Check if the user is the current user or an admin
    let isAuthor = true;

    // If current user is neither admin nor author of requested profile
    if (req.user.username !== username && req.user.role !== "admin") {
        isAuthor = false;
        //  Remove user information from response if user is not the author and not an admin
        let properties = ["email", "createdAt", "isBlocked", "isClosed", "isVerified", "role"];
        for (let property of properties) {
            delete userDetails[0][property]
        }

        //  Remove unnecessary posts fields if the user is not the author and not an admin
        userDetails[0].blogPosts.forEach((post) => {
            let properties = ["isPublished", "content", "tags", "comments", "seoKeywords", "createdAt", "updatedAt", "__v"];
            for (let property of properties) {
                delete post[property]
            }
        })
    }
    if (!isAuthor) {
        userDetails[0].totalBlogs = undefined;
    }
    const blogPostsToSend = userDetails[0].blogPosts.slice(0, 20);

    // Return the user details as a response
    res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        isAuthor: isAuthor ? true : undefined,
        areMore: userDetails[0].blogPosts.length > 20 ? true : false,
        userDetails: {
            skip: skip,
            ...userDetails[0],
            blogPosts: blogPostsToSend
        }
    });
});

/**
 * @authChartData
 * @Route {{server}}/user/profile/chartdata
 * @Method get
 * @Access private ( logged in users only )
 */

export const authChartData = asyncHandler(async function (req, res, next) {
    try {
        const weeks = getWeeklyPartitions();
        const author = mongoose.Types.ObjectId.createFromHexString(req.user.id);
        const likesData = [];
        const followersData = [];
        for (const week of weeks) {
            const likesCount = await Like.countDocuments({
                author,
                createdAt: { $gt: week.start, $lte: week.end },
            });

            const followersCount = await Follower.countDocuments({
                author,
                createdAt: { $gt: week.start, $lte: week.end },
            });
            likesData.push({ week: week.end, count: likesCount });
            followersData.push({ week: week.end, count: followersCount });
        }
        let chartData = { likesData, followersData }
        
        res.status(200).json({
            success: true,
            message: "Chart Data fetched successfully",
            chartData
        })
    } catch (err) {
        return next(new AppError("Some Error Occurred", 500));
    }
});



/**
 * @BlockUser
 * @Route {{server}}/user/profile/:id/block
 * @Method patch
 * @Access private( Only admin )
 * @ReqData username, id
 */

export const blockUser = asyncHandler(async function (req, res, next) {
    // Destructure the request body to get the username and id
    const { username } = req.body;
    const { id } = req.params;

    // Check if username is provided
    if (!username || !id) return next(new AppError("Please provide username and id", 400));

    // Find the user by id
    const user = await User.findById(id);

    // Check if the user exists
    if (!user) {
        return next(new AppError("User not found.", 404));
    }

    // Check if the user's username matches the provided username
    if (user.username !== username) {
        return next(new AppError("Either of Id or Username is Incorrect", 400));
    }

    // Check if the user is an admin
    if (user.role === "admin") {
        return next(new AppError("Admin can not be blocked.", 400));
    }

    // Set the user's blocked status to true
    user.isBlocked = true;

    // Save the user
    await user.save();

    // Send a success response
    res.status(200).json({
        success: true,
        message: `Account with username ${username} has been blocked.`,
    });
});

/**
 * @UnBlockUser
 * @Route {{server}}/user/profile/:id/unblock
 * @Method patch
 * @Access private( Only admin )
 * @ReqData username, id
 */

export const unBlockUser = asyncHandler(async function (req, res, next) {
    // Destructure the request body to get the username and id
    const { username } = req.body;
    const { id } = req.params;

    // Check if username is provided
    if (!username || !id) return next(new AppError("Please provide username and id", 400));

    // Find the user by id
    const user = await User.findById(id);

    // Check if the user exists
    if (!user) {
        return next(new AppError("User not found.", 404));
    }

    // Check if the user's username matches the provided username
    if (user.username !== username) {
        return next(new AppError("Either of Id or Username is Incorrect", 400));
    }

    // Set the user's blocked status to false
    user.isBlocked = false;

    // Save the user
    await user.save();

    // Send a success response
    res.status(200).json({
        success: true,
        message: `Account with username ${username} has been unblocked.`,
    });
});

/**
 * @CloseAccount
 * @Route {{server}}/user/profile/:id/close
 * @Method patch
 * @Access private( logged in users )
 */

export const CloseAccount = asyncHandler(async function (req, res, next) {

    // Find the user by id
    let user = await User.findById(req.user.id);

    // Check if the user exists
    if (!user) {
        // If not, return an error message
        return next(new AppError("Invalid session. Please logout and login again to continue.", 404));
    }

    // Check if the current user is trying to close another user's account
    if (user.role === "admin") {
        // If so, return an error message
        return next(new AppError("Admin can not close account.", 403));
    }

    // Set the isClosed property of the user to true
    user.isClosed = true;

    // Save the updated user
    await user.save();

    // Define the email subject and message
    const subject = "Your Account has been closed.";
    const message = `<html><head><style>body { font-family: Arial, sans-serif; } .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; } .title { font-size: 24px; margin-bottom: 20px; } .message { font-size: 16px; margin-bottom: 20px; } .link { color: #007bff; text-decoration: none; } .link:hover { text-decoration: underline; }</style></head><body><div class="container"><div class="title">Account Closure Confirmation</div><div class="message">Dear ${user.firstName},<br><br>We regret to inform you that your account on Alcodemy Blog has been closed as per your request. We are sorry to see you go and hope that you had a positive experience with us.<br><br>If you have any questions or concerns, please don't hesitate to contact us at <a href="mailto:support@alcodemy.in">support@alcodemy.in</a>.<br><br>Best regards,<br>The Alcodemy Blog Team</div></div></body></html>`;

    // Send the email to the user
    sendEmail(user.email, subject, message);

    // Sending back empty cookie
    const cookieOptions = {
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: 0,
        httpOnly: true,
    }

    // Return a success message
    res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json({
            success: true,
            message: "Account closed successfully",
        });
});

/**
 * @GenerateVerifyToken
 * @Route {{server}}/user/verify/
 * @Method post
 * @Access private( Only logged in user )
 * @ReqData userid
 */

export const VerifyTokenEmail = asyncHandler(async function (req, res, next) {
    // Finding user using user id from req.body
    const user = await User.findById(req.user.id);

    // Checking if user is found or not
    if (!user) {
        return next(new AppError("User not registered!", 404));
    }

    // Checking if the user is already verified
    if (user.isVerified) {
        return next(new AppError("Account already verified.", 400));
    }

    // Generating verification token for email
    const emailtoken = await user.generateVerifyToken();

    // Saving token in database
    await user.save();

    // Making content for email
    const verifyAccountUrl = `${process.env.FRONTEND_URL}/user/${user.username}/account/verify/${emailtoken}`;
const subject = "Verify account in Alcodemy Blog";
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

  .hero {
    text-align: center;
    padding: 20px 0;
  }

  .hero img {
    width: 150px; /* Adjust width as needed */
  }

  .title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .message {
    font-size: 16px;
    margin-bottom: 13px;
  }

  .button {
    background-color: #007bff; /* Replace with primary color */
    color: white!important;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    margin-bottom: 13px;
    cursor: pointer;
    text-decoration: none;
  }

  .button:hover {
    background-color: #0069d9; /* Replace with darker shade */
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
    <div class="hero">
      <img src="https://blog.alcodemy.tech/Alcodemy.png" alt="Alcodemy Blog Logo" />
      <h2>Welcome to Alcodemy Blog!</h2>
    </div>
    <div class="title">Verify Your Account</div><br>
    <div class="message">
      You can verify your account by clicking the button below.
    </div><br>
    <a href="${verifyAccountUrl}" class="button">Verify Account</a>
    <br><br>
    If the button above doesn't work, copy and paste the below URL into your web browser.
    <br>
    <p> <strong>URL :</strong> ${verifyAccountUrl} </p><br>
    <div class="message">
      If you did not request this verification token, please ignore this email.
    </div>
  </div>
</body>
</html>
`;


    try {
        // Sending the token to the email for verification
        await sendEmail(user.email, subject, message);

        // Sending response 
        res.status(200).json({
            success: true,
            message: `Verification token has been sent to your registered Email address, Click on it to verify.`,
        });
    } catch (error) {

        // Handling error by deleting token from database
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;

        await user.save();

        // Sending error response
        return next(
            new AppError(
                error.message || "Something went wrong, please try again.",
                500
            )
        );
    }
});

/**
 * @VerifyAccount
 * @Route {{server}}/user/profile/:username/verify/:token
 * @Method patch
 * @Access public ( AnyOne who is already registered )
 * @ReqData token
 */

export const VerifyAccount = asyncHandler(async function (req, res, next) {
    // Destructuring the url to get username and verifytoken
    let username = req.params.username;
    let verifyToken = req.params.token;

    // Generate hash from the provided verify token
    const verifyPassToken = crypto
        .createHash("sha256")
        .update(verifyToken)
        .digest("hex");

    // Find user with matching verify token and non-expired verify token expiry
    let user = await User.findOne({
        verifyToken: verifyPassToken,
        
    });

    // Check if user exist with the token or not
    if (!user) {
        return next(new AppError("Invalid Token", 404));
    }

    let userinfo = await User.findOne({
        verifyToken: verifyPassToken,
        verifyTokenExpiry: { $gt: Date.now() },
    })

    // Check if user exist with the token or not
    if (!userinfo) {
        return next(new AppError("This Verification Mail has Expired. Please generate new verification mail from your dashboard.", 404));
    }

    // Checking if the username of user is same as in request params
    if (user.username !== username) return next(new AppError("Invalid Username", 400));

    // Making user verified
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = 0;

    await user.save();

    // Sending response
    res.status(200).json({
        success: true,
        message: "Account Verified Successfully",
    });
});

/**
 * @UpdateProfile
 * @Route {{server}}/user/profile
 * @Method patch
 * @Access private( Logged in users only)
 * @ReqData username, firstName, lastName, bio, avatar (optional)
 */

export const updateProfile = asyncHandler(async function (req, res, next) {
    const { firstName, lastName, bio, email } = req.body;
    const { id } = req.user;

    // Check if at least one field is provided for update
    if (!firstName && !lastName && !bio && !req.file && !email ) {
        return next(new AppError("At least one field is required for update.", 400));
    }

    const user = await User.findById(id);

    // Check if user exists
    if (!user) {
        return next(new AppError("Invalid user id or user does not exist", 400));
    }

    if (email) {
        // if (!user.isVerified) user.email = email;
        // else return next(new AppError("Email can not be changed."))

        user.email = email;
        user.isVerified = false;
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;

    // Handle avatar upload
    if (req.file) {
        try {
            // Remove the old image from cloudinary
            if (user.avatar.public_id) {
                await cloudinary.v2.uploader.destroy(user.avatar.public_id);
            }
            // uploading new avatar
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "blog/user/avatar",
                resource_type: "image",
                width: 350,
                height: 350,
                gravity: "faces",
                crop: "fill",
            });

            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;
            }

            fs.rm(`uploads/${req.file.filename}`);
        } catch (error) {
            console.log("not uploaded");
            for (const file of await fs.readdir("uploads/")) {
                if (file == ".gitkeep") continue;
                await fs.unlink(path.join("uploads/", file));
            }
            return next(
                new AppError(JSON.stringify(error) || "File not uploaded, please try again", 400)
            );
        }
    }

    const updatedUser = await user.save({ new: true });

    // Remove password field from user object before sending it as a response
    user.password = undefined;

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
            tokens: { accessToken, refreshToken }
        }
    });
});

/**
 * @UpdateBackgroundImage
 * @Route {{server}}/user/backgroundImage
 * @Method patch
 * @Access private( Logged in users only)
 * @ReqData file
 */

export const updateBgImage = asyncHandler(async function (req, res, next) {
    const { id } = req.user;

    if (!req.file) {
        return next(new AppError("At least one field is required for update.", 400));
    }

    const user = await User.findById(id);

    // Check if user exists
    if (!user) {
        return next(new AppError("Invalid user id or user does not exist", 400));
    }

    // Handle avatar upload
    if (req.file) {
        try {
            // Remove the old image from cloudinary
            if (user.bgImage) {
                await cloudinary.v2.uploader.destroy(user.avatar.public_id);
            }
            // uploading new avatar
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "blog/user/bgImage",
                resource_type: "image",
                width: 1920,
                height: 1080,
                // gravity: "faces",
                crop: "fill",
            });

            if (result) {
                user.bgImage.public_id = result.public_id;
                user.bgImage.secure_url = result.secure_url;
            }

            fs.rm(`uploads/${req.file.filename}`);
        } catch (error) {
            console.log("not uploaded");
            for (const file of await fs.readdir("uploads/")) {
                if (file == ".gitkeep") continue;
                await fs.unlink(path.join("uploads/", file));
            }
            return next(
                new AppError(JSON.stringify(error) || "File not uploaded, please try again", 400)
            );
        }
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Background Image has been updated"
        });
})


/**
 * @DeleteUser
 * @Route {{server}}/user/profile/:id
 * @Method delete
 * @Access private (only logged in users);
 * @ReqData id
 */

export const DeleteUser = asyncHandler(async function (req, res, next) {
    const { id } = req.params;

    // Checking user authorization
    if (req.user.id !== id && req.user.role !== "admin") {
        return next(new AppError('You do not have permission to perform this action', 403))
    }

    // Finding user
    const user = await User.findById(id);

    // Check if the post exists
    if (!user) return next(new AppError("User not found", 404));

    if (user.role === "admin") {
        return next(new AppError("Admin account cannot be deleted.", 403));
    }

    user.isBlocked = true;
    await user.save();

    try {
        // Delete all resources with the specified prefix (folder path)
        await cloudinary.v2.api.delete_resources_by_prefix(`blog/posts/${user.username}`);

        // Delete the folder and all resources within it
        await cloudinary.v2.api.delete_folder(`blog/posts/${user.username}`);

    } catch (error) {
        console.log(error.error.message)
    }

    // Remove the old image from cloudinary
    if (user.avatar.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }

    // Delete the post from the database
    await Promise.all([
        Blog.deleteMany({ author: id }),
        Like.deleteMany({ author: id }),
        Follower.deleteMany({ author: id }),
        Comment.deleteMany({ blogAuthor: id }),
        Resourcefile.deleteMany({ user: id })
      ]);

    // Remove the post ID from the user's blogs array
    await User.findByIdAndDelete(id);

    // Respond with success message and post details
    res.status(200).json({
        success: true,
        message: `User with username ${user.username} deleted successfully`
    });
});

/**
 * @RegisteredUsers
 * @Route {{sever}}/user/profile
 * @Method get
 * @Access private (only admin)
 * @ReqData skip
 */

export const AllUsers = asyncHandler(async function (req, res, next) {
    const skip = Number(req.query.skip) || 0;
    const limit = 21;
    const users = await User.find()
        .sort([['createdAt', -1]])
        .skip(skip)
        .limit(limit)

    res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        count: await User.countDocuments(),
        data: users
    })
})
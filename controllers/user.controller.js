import AppError from "../utils/appError.js";
import User from "../models/user.model.js";
import path from "path";
import sendEmail from "../utils/emailHandler.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import asyncHandler from "../middlewares/async.middleware.js";
import crypto, { verify } from "crypto";

const cookieOptions = {
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 2 * 24 * 60 * 60 * 1000,
    httpOnly: true,
};

/**
 * @CreateUser
 * @Route {{URL}}/api/v1/user/register
 * @Method post
 * @Access public
 * @ReqData username, email, firstName, lastName, password
 */
export const registerUser = asyncHandler(async function (req, res, next) {
    // Destructure the request body to get the user details
    const { username, email, firstName, lastName, password } = req.body;

    // Check if all the required fields are provided
    if (!username || !email || !firstName || !lastName || !password) {
        return next(new AppError("All fields are mandatory.", 400));
    }

    // Check if a user with the provided email already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
        return next(new AppError("User Already registered.", 409));
    }

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
            console.log("not uploaded");
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

    // Generate a JWT token for the user
    const token = await user.generateJWTToken();

    // Set the JWT token as a cookie in the response
    res.cookie("token", token, cookieOptions);

    // Send a success response with the user's details
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
            role: user.role,
        },
    });
});

/**
 * @LoginUser
 * @Route {{URL}}/api/v1/user/login
 * @Method post
 * @Access public
 * @ReqData username, password
 */

export const loginUser = asyncHandler(async function (req, res, next) {
    const { username, password } = req.body;

    // Checking if the username and password exist
    if (!username || !password) {
        return next(new AppError("Username and Password is mandatory", 400));
    }

    // Finding the User in Database by username and if found then compare password
    const user = await User.findOne({ username: username.toLowerCase() }).select(
        "+password"
    );

    if (!(user && (await user.comparePassword(password)))) {
        return next(
            new AppError("Email or Password do not match or user does not exist", 401)
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
    const token = await user.generateJWTToken();

    delete user.password;

    // Sending cookies
    res.cookie("token", token, cookieOptions);

    // Sending the response
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
            isBlocked: user.isBlocked,
            userInfo: user.info || null,
        },
    });
});

/**
 * @LogOut
 * @Route {{URL}}/api/v1/user/logout
 * @Method post
 * @Access private( Logged In users only )
 */

export const userLogOut = asyncHandler(async function (req, res, next) {
    // Sending back empty cookie
    res.cookie("token", null, {
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: 0,
        httpOnly: true,
    });

    // Sending back response data
    res.status(200).json({
        success: true,
        message: "User logged Out successfully",
    });
});

/**
 * @ForgotPassword
 * @Route {{URL}}/api/v1/user/forgotpassword
 * @Method post
 * @Access public
 * @ReqData email
 */

export const forgotPassword = asyncHandler(async function (req, res, next) {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return new AppError("Email is required", 400);
    }
    // Find user by email
    const user = await User.findOne({ email });

    // If user is not found, return error
    if (!user) {
        return next(new AppError("Email not registered", 404));
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
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>.<br/><br/>If the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.<br/><br/> If you have not requested this, kindly ignore.`;

    try {
        // Send password reset email
        await sendEmail(email, subject, message);
        res.status(200).json({
            success: true,
            message: `Reset password link has been sent to ${email} successfully`,
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
 * @Route {{URL}}/api/v1/user/reset/:id
 * @Method post
 * @Access public
 * @ReqData resettoken in param and password
 */

export const resetPassword = asyncHandler(async function (req, res, next) {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Validate password field
    if (!password) {
        return next(new AppError("Password is required", 400));
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
 * @Route {{URL}}/api/v1/user/change-password
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

    // Find the user by id and select the password field
    const user = await User.findById(id).select("+password");

    // Check if the user exists
    if (!user) {
        return next(new AppError("Invalid user id or user does not exist", 400));
    }

    // Check if the user has been blocked by admin
    if (user.isBlocked) {
        return next(
            new AppError(`Your account has been blocked. Please contact support`, 403)
        );
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
 * @Route {{URL}}/api/v1/user/profile/:username
 * @Method get
 * @Access private( Logged in users only )
 * @ReqData username
 */

export const userProfile = asyncHandler(async function (req, res, next) {
    // Get the username from the request parameters
    const { username } = req.params;

    // Query the database to find the user with the given username
    const userDetails = await User.aggregate([
        { $match: { username } },
        // Join with the followers collection to get the total number of followers
        {
            $lookup: {
                from: "followers",
                localField: "_id",
                foreignField: "author",
                as: "isFollowing",
            },
        },
        {
            $addFields: {
                totalFollowers: { $size: "$isFollowing" },
            },
        },
        // Join with the blogs collection to get the user's blog posts
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
        // Limit the number of blog posts returned to 20
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
                blogPosts: { $slice: ["$blogPosts", 20] },
                totalPosts: 1,
                isBlocked: 1,
                isClosed: 1,
                isVerified: 1,
            },
        },
    ]);

    // If the user was not found, return a 404 error
    if (userDetails.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has been blocked by the admin
    if (userDetails[0].isBlocked && req.user.role === "user") {
        return next(new AppError(`This account has been blocked by admin.`, 403));
    }

    // Check if the account is closed
    if (userDetails[0].isClosed && req.user.role === "user") {
        return next(new AppError(`This account has been closed.`, 403));
    }

    // Check if the user is the current user or an admin
    let isAuthor = false;
    if (req.user.username === username) {
        isAuthor = true;
    }

    // Return the user details as a response
    res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        isAuthor,
        userDetails: userDetails[0],
    });
});

/**
 * @BlockUser
 * @Route {{URL}}/api/v1/user/profile/:id/block
 * @Method patch
 * @Access private( Only admin )
 * @ReqData username, id
 */

export const blockUser = asyncHandler(async function (req, res, next) {
    // Destructure the request body to get the username and id
    const { username } = req.body;
    const { id } = req.params;

    // Check if username is provided
    if (!username) return next(new AppError("Please provide username", 400));

    // Check if the user is an admin
    if (req.user.role !== "admin") {
        return next(new AppError("Unauthorized request", 401));
    }

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
    await user.generateJWTToken();

    // Save the user
    await user.save();

    // Send a success response
    res.status(200).json({
        success: true,
        message: "The account has been blocked.",
    });
});

/**
 * @UnBlockUser
 * @Route {{URL}}/api/v1/user/profile/:id/unblock
 * @Method patch
 * @Access private( Only admin )
 * @ReqData username, id
 */

export const unBlockUser = asyncHandler(async function (req, res, next) {
    // Destructure the request body to get the username and id
    const { username } = req.body;
    const { id } = req.params;

    // Check if username is provided
    if (!username) return next(new AppError("Please provide username", 400));

    // Check if the user is an admin
    if (req.user.role !== "admin") {
        return next(new AppError("Unauthorized request", 401));
    }

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
        message: "The account has been unblocked successfully.",
    });
});

/**
 * @CloseAccount
 * @Route {{URL}}/api/v1/user/profile/:id/close
 * @Method patch
 * @Access private( logged in users )
 * @ReqData username, id
 */

export const CloseAccount = asyncHandler(async function (req, res, next) {
    // Get the user id from the request parameters
    const { id } = req.params;
    // Get the username from the request body
    const { username } = req.body;

    // Check if the username is provided
    if (!username) {
        // If not, return an error message
        return next(new AppError("Please provide username.", 400));
    }

    // Find the user by id
    let user = await User.findById(id);

    // Check if the user exists
    if (!user) {
        // If not, return an error message
        return next(new AppError("Username is invalid", 404));
    }

    // Check if the provided username matches the username of the user found
    if (user.username !== username)
        return next(new AppError("Either Id or Username is Incorrect.", 400));

    // Check if the current user is trying to close another user's account
    if (
        (req.user.role === "user" && req.user.username !== username) ||
        user.role === "admin"
    ) {
        // If so, return an error message
        return next(
            new AppError("You don't have permission to perform this action.", 403)
        );
    }

    // Set the isClosed property of the user to true
    user.isClosed = true;

    // Save the updated user
    await user.save();

    // Define the email subject and message
    const subject = "Your Account has been closed.";
    const message = `<html><head><style>body { font-family: Arial, sans-serif; } .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; } .title { font-size: 24px; margin-bottom: 20px; } .message { font-size: 16px; margin-bottom: 20px; } .link { color: #007bff; text-decoration: none; } .link:hover { text-decoration: underline; }</style></head><body><div class="container"><div class="title">Account Closure Confirmation</div><div class="message">Dear ${user.firstName},<br><br>We regret to inform you that your account on Alcodemy Blog has been closed as per your request. We are sorry to see you go and hope that you had a positive experience with us.<br><br>If you have any questions or concerns, please don't hesitate to contact us at <a href="mailto:support@alcodemy.in">support@alcodemy.in</a>.<br><br>Best regards,<br>The Alcodemy Blog Team</div></div></body></html>`;
    const email = user.email;
    // Send the email to the user
    sendEmail(email, subject, message);

    if (req.user.role !== "admin" && req.user.username === username) {
        // Clear the token cookie
        res.cookie("token", null, {
            secure: process.env.NODE_ENV === "production" ? true : false,
            maxAge: 0,
            httpOnly: true,
        });
    }

    // Return a success message
    res.status(200).json({
        success: true,
        message: "Account closed successfully",
    });
});

/**
 * @GenerateVerifyToken
 * @Route {{URL}}/api/v1/user/verify/
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

    // Checking if user is blocked by admin
    if (user.isBlocked) {
        return next(new AppError("This account has been blocked by Admin.", 403));
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
    const verifyAccountUrl = `${process.env.FRONTEND_URL}/api/v1/user/profile/${user.username}/verify/${emailtoken}`;
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
      <div class="title">Verify Account in Alcodemy Blog</div>
      <div class="message">
        You can verify your account by clicking the button below. If the button
        doesn't work, copy and paste the URL into your web browser.
      </div>
      <a href="${verifyAccountUrl}" class="link">Verify Account</a>
      <br>
      <p> URL : ${verifyAccountUrl} </p>
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
            message: `Verify token has been sent to ${user.email} successfully`,
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
 * @Route {{URL}}/api/v1/user/profile/:username/verify/:token
 * @Method patch
 * @Access public ( AnyOne )
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
    const user = await User.findOne({
        verifyToken: verifyPassToken,
        verifyTokenExpiry: { $gt: Date.now() },
    });

    // Check if user exist with the token or not
    if (!user) {
        return next(new AppError("Invalid Token", 404));
    }

    // Checking if the username of user is same as in request params
    if(user.username !== username) return next(new AppError("Eithor the token or username is invalid", 400));

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
 * @Route {{URL}}/api/v1/user/profile
 * @Method patch
 * @Access private( Logged in users only)
 * @ReqData username, firstName, lastName, bio, avatar (optional)
 */

export const updateProfile = asyncHandler(async function (req, res, next) {
    const { username, firstName, lastName, bio, avatar } = req.body;
    const { id } = req.user;
  
    // Check if at least one field is provided for update
    if (!username && !firstName && !lastName && !bio && !avatar && !req.file) {
      return next(new AppError("At least one field is required for update.", 400));
    }
  
    const user = await User.findById(id);
  
    // Check if user exists
    if (!user) {
      return next(new AppError("Invalid user id or user does not exist", 400));
    }

    // Checking if the user is blocked
    if(user.isBlocked) return next(new AppError("This account is blocked by admin", 403));
  
    // Update user fields
    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;
  
    // Handle avatar upload
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
  
    // Remove password field from user object before sending it as a response
    user.password = undefined;
  
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  });
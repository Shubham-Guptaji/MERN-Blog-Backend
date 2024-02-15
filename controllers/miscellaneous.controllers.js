import asyncHandler from "../middlewares/async.middleware.js";
import AppError from "../utils/appError.js";

/**
 * @ContactForm
 * @Route {{URL}}/api/v1/contact
 * @Method post
 * @Access public
 * @ReqData name, email, subject, message
 */

export const contactformHandler = asyncHandler(async function(req, res, next) {
    try {
        const { name, email, subject, message } = req.body;

        if(!name || !email || !subject || !message) {
            return next(new AppError("All fields are mandatory", 400))
        }

        const newContact = new ContactForm({
          name,
          email,
          subject,
          message
        });
    
        await newContact.save();

        res.status(200).json({ success: true, message: 'Form submitted successfully!' });
    
      } catch (error) {
        console.error('Error submitting contact form:', error);
        return next(new AppError("Some Error occurred! Try again later", 500))
      }
})

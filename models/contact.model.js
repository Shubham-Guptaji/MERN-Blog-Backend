import { Schema, model } from 'mongoose';

const contactFormSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please fill in a valid email address',
    ],
    required: [true, "Email is required"]
  },
  subject: {
    type: String,
    trim: true,
    required: [true, "Subject is required"]
  },
  message: {
    type: String,
    trim: true,
    required: [true, "Message is required"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {timestamps: true});

const ContactForm = model('ContactForm', contactFormSchema);

export default ContactForm;

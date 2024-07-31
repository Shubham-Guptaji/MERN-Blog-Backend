import {google} from 'googleapis';
import { config } from "dotenv";
config();
import keys from "./credentials.json" assert { type: "json" };

console.log(keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0])

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

console.log(GOOGLE_CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI)

const oauth2Client = new google.auth.OAuth2(
  // GOOGLE_CLIENT_ID,
  // CLIENT_SECRET,
  // REDIRECT_URI
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0]
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'profile'
];

const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope, you can pass it as a string
  scope: scopes
});

export default oauth2Client;
// import {google} from 'googleapis';
import {OAuth2Client} from 'google-auth-library';
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

  const oAuth2Client = new OAuth2Client(
    keys.web.client_id,
    keys.web.client_secret,
    // keys.web.redirect_uris[0]
    'postmessage'
  );

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'profile'
];

oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

export default oAuth2Client;
import {OAuth2Client} from 'google-auth-library';
import { config } from "dotenv";
config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


  const oAuth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    CLIENT_SECRET,
    'postmessage'
  );

const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

export default oAuth2Client;
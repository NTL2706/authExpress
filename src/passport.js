const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const config = require("./config");
const { v4: uuidv4 } = require('uuid');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRETS,
      callbackURL: '/users/google/callback',
    },
    (accessToken, refreshToken, profile, cb) => cb(null, profile)
  )
);

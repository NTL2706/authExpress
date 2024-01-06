import Passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';

import { CONFIG } from 'configs/constants';

Passport.serializeUser((user, done) => {
  done(null, user);
});

Passport.deserializeUser((user, done) => {
  done(null, user);
});

Passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: CONFIG.CLIENT_ID,
      clientSecret: CONFIG.CLIENT_SECRETS,
      callbackURL: '/users/google/callback'
    },
    (accessToken, refreshToken, profile, cb) => cb(null, profile)
  )
);

export default Passport;

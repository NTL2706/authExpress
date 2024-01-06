import express from 'express';
import passport from 'passport';

import {
  onLogin,
  onRegister,
  onForgotPassword,
  onResetPassword,
  onLoginGoogle,
  onLogout,
  onGetProfile
} from 'controllers/auth_controller';
import { validateToken, emailValidation, passwordValidation } from 'middlewares/validate';

const registerValidation = [emailValidation, passwordValidation];
const forgotValidation = [emailValidation, passwordValidation];

const router = express.Router();

// Authentication routes
router.post('/login', onLogin);
router.post('/register', registerValidation, onRegister);
router.post('/forgot-password', forgotValidation, onForgotPassword);
router.put('/reset-password', registerValidation, onResetPassword);

// Google authentication
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), onLoginGoogle);

// Logout route with token validation middleware
router.post('/logout', validateToken, onLogout);

router.get('/me', validateToken, onGetProfile);

export default router;

const express = require('express');
const bodyParser = require('body-parser');
const { check } = require('express-validator');
const router = express.Router();
const {
  postLogin,
  postRegister,
  postForgotPw,
  postResetPw,
  loginGoogle,
  postLogout,
} = require('../controllers/auth_controller');
const passport = require('passport');
const validateToken = require('../middlewares/validate');

// Validation checks
const emailValidation = check('email')
  .isEmail()
  .withMessage('Please enter a valid email address');
const passwordValidation = check('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');
const registerValidation = [emailValidation, passwordValidation];
const forgotValidation = [emailValidation, passwordValidation];

router.use(bodyParser.json());

// Authentication routes
router.post('/login', postLogin);
router.post('/register', registerValidation, postRegister);
router.post('/forgot-pw', forgotValidation, postForgotPw);
router.put('/reset-pw', registerValidation, postResetPw);

// Google authentication
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  loginGoogle
);

// Logout route with token validation middleware
router.post('/logout', validateToken, postLogout);

module.exports = router;

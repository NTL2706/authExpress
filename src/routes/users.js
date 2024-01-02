const express = require('express')
const bodyParser = require('body-parser')
const { check } = require('express-validator')
const router = express.Router()
const passport = require('passport')
const {
  onLogin,
  onRegister,
  onForgotPassword,
  onResetPassword,
  onLoginGoogle,
  onLogout,
} = require('../controllers/auth_controller')
const validateToken = require('../middlewares/validate')

// Validation checks
const emailValidation = check('email')
  .isEmail()
  .withMessage('Please enter a valid email address')
const passwordValidation = check('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters')
const registerValidation = [emailValidation, passwordValidation]
const forgotValidation = [emailValidation, passwordValidation]

router.use(bodyParser.json())

// Authentication routes
router.post('/login', onLogin)
router.post('/register', registerValidation, onRegister)
router.post('/forgot-password', forgotValidation, onForgotPassword)
router.put('/reset-password', registerValidation, onResetPassword)

// Google authentication
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
)
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  onLoginGoogle
)

// Logout route with token validation middleware
router.post('/logout', validateToken, onLogout)

module.exports = router

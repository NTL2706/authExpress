const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const passport = require('passport')
const {
    onLogin,
    onRegister,
    onForgotPassword,
    onResetPassword,
    onLoginGoogle,
    onLogout,
    getProfile
} = require('../controllers/auth_controller')
const {
    validateToken,
    emailValidation,
    passwordValidation,
} = require('../middlewares/validate')

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
router.get(
    '/profile',
    validateToken,
    getProfile
)

// Logout route with token validation middleware
router.post('/logout', validateToken, onLogout)

module.exports = router

const userDb = require('../models/User');
const { createError, BAD_REQUEST } = require('../helpers/error_helper');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { genToken } = require("../helpers/token_helper");
const speakeasy = require('speakeasy');
const redis = require("../../config/redis.config");
const config = require("../config");

const postLogin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(
            createError({
                status: BAD_REQUEST,
                message: 'Email and password are required fields',
            })
        );
    }

    try {
        const foundUser = await userDb.findOne({ email });
        const isValidPassword =
            foundUser && (await bcrypt.compare(password, foundUser.password));

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = genToken({
            email: foundUser.email,
            name: foundUser.username,
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

const postRegister = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existingUser = await userDb.findOne({ email });
        if (existingUser) {
            return res.status(490).json({ message: 'Email already exists' });
        }

        const secret = speakeasy.generateSecret({ length: 20 });
        const newUser = await userDb.create({
            username,
            password: hashedPassword,
            email,
            secret: secret.base32,
        });

        const token = genToken({ username, email });

        return res.status(201).json({
            message: 'User created successfully',
            token,
            secret: secret.base32,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating user' });
    }
};

const postForgotPw = async (req, res, next) => {
    const otp = String(req.body.otp);
    const email = String(req.body.email);

    try {
        const user = await userDb.findOne({ email });
        if (!user)
            return res.status(401).json({ message: 'Invalid email' });
        if (user.secret === '')
            return res.status(401).json({ message: 'Account login google' });

        const verified = speakeasy.totp.verify({
            secret: user.secret,
            encoding: 'base32',
            token: otp,
            window: 1,
        });

        if (verified) {
            redis.set(`reset/${email}`, 'check', 'EX', config.TIME_EXPIRE_RESET_PW);
            return res.status(200).json({ message: 'Verify success' });
        }
        return res.status(401).json({ message: 'Verify fail' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error creating user' });
    }
};

const postResetPw = async (req, res, next) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const checkExpire = await redis.get(`reset/${email}`);
        if (!checkExpire)
            return res
                .status(401)
                .json({ message: 'Expired time for password reset' });

        const foundUser = await userDb.findOne({ email });
        if (!foundUser || (await bcrypt.compare(password, foundUser.password))) {
            return res
                .status(401)
                .json({ message: 'Invalid email or duplicated new password' });
        }

        await userDb.update({ email }, { password: hashedPassword });
        redis.del(`reset/${email}`);

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating user' });
    }
};

const loginGoogle = async (req, res, next) => {
    const data = req.user._json;
    const email = String(data.email);
    const username = String(data.name);

    try {
        const foundUser = await userDb.findOne({ email });
        if (!foundUser) {
            await userDb.create({
                username,
                password: '',
                email,
                secret: '',
            });
        }
        const token = genToken({ username, email });

        return res.status(201).json({
            message: 'User created successfully',
            token,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error create user' });
    }
};

const postLogout = async (req, res, next) => {
    const { token } = req.user;

    const accessCaches = await redis.get(`accessToken/${token}`);
    const { refreshToken } = JSON.parse(accessCaches);

    await redis.del(`accessToken/${token}`, `refreshToken/${refreshToken}`);
    return res.status(200).json({ message: 'Logout success' });
};

module.exports = {
    postLogin,
    postRegister,
    postForgotPw,
    postResetPw,
    loginGoogle,
    postLogout,
};
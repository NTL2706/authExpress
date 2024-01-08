import bcrypt from 'bcrypt';
import { check, validationResult } from 'express-validator';
import speakeasy from 'speakeasy';

import { CONFIG, ERROR_CODE } from 'configs/constants';
import { redis } from 'configs/database';
import { createError, genToken } from 'helpers';
import User from 'models/User';
import { sendMail } from 'services/sendMail';

const onLogin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(
            createError({
                status: ERROR_CODE.BAD_REQUEST,
                message: 'Email and password are required fields'
            })
        );
    }

    try {
        const foundUser = await User.findOne({ email });
        const isValidPassword = foundUser && (await bcrypt.compare(password, foundUser.password));

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = genToken({
            email: foundUser.email,
            id: foundUser.user_id
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

const onRegister = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(490).json({ message: 'Email already exists' });
        }

        const secret = speakeasy.generateSecret({ length: 20 });
        const newUser = await User.create({
            password: hashedPassword,
            email,
            secret: secret.base32
        });

        const token = genToken({ id: newUser[0], email });

        return res.status(201).json({
            message: 'User created successfully',
            token,
            secret: secret.base32
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating user' });
    }
};

const sendOtpForMail = async (req, res, next) => {
    const email = String(req.body.email);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email' });

    function generateOTP() {
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp.toString(); // Chuyển số thành chuỗi và trả về
    }

    const otp = generateOTP()
    redis.set(`otp/${email}`, String(otp), 'EX', CONFIG.TIME_EXPIRE_RESET_PW);

    try {
        await sendMail(email, "Forgot password otp", `${otp}. This is otp to verify forgot password`)
        return res.status(200).json({ message: 'success' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error forgot pw user' });
    }
}

const onForgotPassword = async (req, res, next) => {
    const otp = String(req.body.otp);
    const email = String(req.body.email);

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email' });
        if (user.secret === '') return res.status(401).json({ message: 'Account login google' });


        const checkOtp = await redis.get(`otp/${email}`);
        if (checkOtp && checkOtp === otp) {
            redis.del(`otp/${email}`);
            redis.set(`reset/${email}`, 'check', 'EX', CONFIG.TIME_EXPIRE_RESET_PW);
            return res.status(200).json({ message: 'Verify success' });
        }
        return res.status(401).json({ message: 'Verify fail' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error forgot pw user' });
    }
};

const onResetPassword = async (req, res, next) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const checkExpire = await redis.get(`reset/${email}`);
        if (!checkExpire) return res.status(401).json({ message: 'Expired time for password reset' });

        const foundUser = await User.findOne({ email });
        if (!foundUser || (await bcrypt.compare(password, foundUser.password))) {
            return res.status(401).json({ message: 'Invalid email or duplicated new password' });
        }

        await User.update({ email }, { password: hashedPassword });
        redis.del(`reset/${email}`);

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating user' });
    }
};

const onLoginGoogle = async (req, res, next) => {
    const data = req.user._json;
    const email = String(data.email);

    try {
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            await User.create({
                password: '',
                email,
                secret: ''
            });
        }
        const token = genToken({ email });

        return res.status(201).json({
            message: 'User created successfully',
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error create user' });
    }
};

const onLogout = async (req, res, next) => {
    const { token } = req.user;

    const accessCaches = await redis.get(`accessToken/${token}`);
    const { refreshToken } = JSON.parse(accessCaches);

    await redis.del(`accessToken/${token}`, `refreshToken/${refreshToken}`);
    return res.status(200).json({ message: 'Logout success' });
};

const onGetProfile = async (req, res, next) => {
    const { email } = req.user.payload;

    try {
        const profile = await User.findOne({ email });

        return res.status(200).json({
            data: {
                email: profile.email,
                id: profile.user_id,
                secret: profile.secret
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json();
    }
};

export { onLogin, onRegister, onForgotPassword, onResetPassword, onGetProfile, onLogout, onLoginGoogle, sendOtpForMail };

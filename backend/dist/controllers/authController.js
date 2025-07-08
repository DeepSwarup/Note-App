"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.getLoginOtp = exports.signup = exports.getOtp = exports.googleCallback = exports.googleAuth = exports.authenticateToken = void 0;
const user_1 = require("../models/user");
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const userModel = new user_1.UserModel(config_1.client);
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// Configure Google Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // callbackURL: 'http://localhost:5000/auth/google/callback',
    callbackURL: 'https://note-app-somf.onrender.com/google/callback',
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = (yield userModel.findUserByEmail(profile.emails[0].value)) || (yield userModel.findUserByGoogleId(profile.id));
        if (existingUser) {
            return done(null, existingUser);
        }
        const newUser = {
            email: profile.emails[0].value,
            name: profile.displayName,
            googleId: profile.id,
        };
        yield userModel.createUser(newUser);
        return done(null, newUser);
    }
    catch (error) {
        return done(error);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user.email);
});
passport_1.default.deserializeUser((email, done) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel.findUserByEmail(email);
    done(null, user);
}));
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const token = ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.token);
    // console.log('Received token from header or cookie:', token);
    if (!token) {
        // console.error('No token provided');
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        const decoded = yield jsonwebtoken_1.default.verify(token, config_1.SECRET_KEY);
        // console.log('Decoded token payload:', decoded);
        req.body = req.body || {};
        req.body.user = decoded;
        next();
    }
    catch (err) {
        // console.error('Token verification error:', (err as Error).message);
        res.status(403).json({ error: 'Invalid token' });
        return;
    }
});
exports.authenticateToken = authenticateToken;
exports.googleAuth = passport_1.default.authenticate('google', { scope: ['profile', 'email'] });
const googleCallback = (req, res, next) => {
    passport_1.default.authenticate('google', { session: false }, (err, user, info) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            // console.error('Google callback error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            // console.error('No user from Google auth:', info);
            return res.status(401).json({ error: 'Google authentication failed' });
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, id: user._id || user.googleId, name: user.displayName }, config_1.SECRET_KEY, { expiresIn: '1h' });
        console.log('Generated new token:', token.substring(0, 10) + '... for user:', { email: user.email, id: user._id || user.googleId, name: user.displayName });
        res.clearCookie('token');
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 3600000,
        });
        res.redirect('http://localhost:5173/welcome');
    }))(req, res, next);
};
exports.googleCallback = googleCallback;
const getOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, dateOfBirth, email } = req.body;
        // console.log('Request body:', { name, dateOfBirth, email });
        const existingUser = yield userModel.findUserByEmail(email);
        if (existingUser) {
            // console.log('Existing user found:', existingUser);
            res.status(400).json({ error: 'Email already registered' });
            return;
        }
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        yield userModel.createUser({ name, dateOfBirth, email, otp, otpExpires });
        // console.log('User created with OTP:', otp);
        yield config_1.transporter.sendMail({
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Your OTP for Signup',
            text: `Your OTP for signup is ${otp}. It is valid for 10 minutes.`,
        });
        // console.log(`OTP ${otp} sent to ${email}`);
        res.status(200).json({ message: 'OTP sent successfully' });
    }
    catch (error) {
        // console.error('Error in getOtp:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getOtp = getOtp;
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const user = yield userModel.findUserByEmail(email);
        if (!user || !user.otp || !user.otpExpires || new Date() > user.otpExpires) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }
        if (user.otp !== otp) {
            res.status(400).json({ error: 'Incorrect OTP' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, id: user._id, name: user.name }, config_1.SECRET_KEY, { expiresIn: '1h' });
        yield userModel.updateUser(email, { otp: undefined, otpExpires: undefined });
        res.status(200).json({ message: 'Signup successful', token });
    }
    catch (error) {
        // console.error('Error in signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.signup = signup;
const getLoginOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // console.log('Login OTP request for:', email);
        const user = yield userModel.findUserByEmail(email);
        if (!user) {
            res.status(400).json({ error: 'Email not registered' });
            return;
        }
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        yield userModel.updateUser(email, { otp, otpExpires });
        yield config_1.transporter.sendMail({
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Your OTP for Login',
            text: `Your OTP for login is ${otp}. It is valid for 10 minutes.`,
        });
        // console.log(`Login OTP ${otp} sent to ${email}`);
        res.status(200).json({ message: 'OTP sent successfully' });
    }
    catch (error) {
        // console.error('Error in getLoginOtp:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getLoginOtp = getLoginOtp;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const user = yield userModel.findUserByEmail(email);
        if (!user || !user.otp || !user.otpExpires || new Date() > user.otpExpires) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }
        if (user.otp !== otp) {
            res.status(400).json({ error: 'Incorrect OTP' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, id: user._id, name: user.name }, config_1.SECRET_KEY, { expiresIn: '1h' });
        // console.log('Generated token for user:', { email: user.email, id: user._id }, 'Token:', token);
        yield userModel.updateUser(email, { otp: undefined, otpExpires: undefined });
        // Set HTTP-only cookie and return token in response
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true for HTTPS in production
            sameSite: 'none',
            maxAge: 3600000, // 1 hour
        });
        res.status(200).json({ message: 'Login successful', token }); // Return token for debugging
    }
    catch (error) {
        // console.error('Error in login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.login = login;
const logout = (req, res) => {
    try {
        res.clearCookie('token'); // Clear the HTTP-only cookie
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        // console.error('Error in logout:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.logout = logout;
// Keep other functions as they are

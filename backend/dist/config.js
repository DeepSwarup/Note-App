"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = exports.client = exports.uri = exports.SECRET_KEY = void 0;
const mongodb_1 = require("mongodb");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.SECRET_KEY = process.env.SECRET_KEY;
exports.uri = process.env.MONGODB_URI;
exports.client = new mongodb_1.MongoClient(exports.uri);
exports.transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    secure: true,
    port: 587,
    tls: {
        rejectUnauthorized: false,
    },
});
exports.transporter.verify((error, success) => {
    if (error) {
        console.error('Email service error:', error);
    }
    else {
        console.log('Email service is ready');
    }
});

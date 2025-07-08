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
const express_1 = __importDefault(require("express"));
const authController_1 = require("./controllers/authController");
const noteController_1 = require("./controllers/noteController");
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const port = 5000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent
}));
// app.use(session({ secret: 'your-session-secret', resave: false, saveUninitialized: false }));
app.use(passport_1.default.initialize());
// app.use(passport.session());
app.use((0, cookie_parser_1.default)());
const config_1 = require("./config");
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield config_1.client.connect();
            console.log('Connected to MongoDB Atlas');
        }
        catch (error) {
            console.error('MongoDB connection error:', error);
        }
    });
}
connectDB();
app.post('/api/get-otp', authController_1.getOtp);
app.post('/api/signup', authController_1.signup);
app.post('/api/login-otp', authController_1.getLoginOtp);
app.post('/api/login', authController_1.login);
app.get('/auth/google', authController_1.googleAuth);
app.get('/auth/google/callback', authController_1.googleCallback); // Removed duplicate callback
app.get('/api/notes', noteController_1.getNotes);
app.post('/api/notes', noteController_1.addNote);
app.delete('/api/notes/:id', noteController_1.deleteNote);
app.post('/api/logout', authController_1.logout);
app.get('/', (req, res) => {
    res.send('Note-Taking App Backend');
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    yield config_1.client.close();
    process.exit(0);
}));

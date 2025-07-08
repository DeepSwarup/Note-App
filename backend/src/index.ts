import express from 'express';
import { MongoClient } from 'mongodb';
import { getOtp, signup, getLoginOtp, login, googleAuth, googleCallback, logout, authenticateToken } from './controllers/authController';
import { getNotes, addNote, deleteNote } from './controllers/noteController';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors({
  // origin: 'http://localhost:5173',
  origin: 'https://note-app-jet-eight.vercel.app',
  credentials: true, // Allow cookies to be sent
}));
// app.use(session({ secret: 'your-session-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
// app.use(passport.session());
app.use(cookieParser());

import { client } from './config';

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

connectDB();

app.post('/api/get-otp', getOtp);
app.post('/api/signup', signup);
app.post('/api/login-otp', getLoginOtp);
app.post('/api/login', login);
app.get('/auth/google', googleAuth);
app.get('/auth/google/callback', googleCallback); // Removed duplicate callback
app.get('/api/notes',authenticateToken,getNotes);
app.post('/api/notes', authenticateToken,addNote);
app.delete('/api/notes/:id', authenticateToken,deleteNote);
app.post('/api/logout', logout);

app.get('/', (req, res) => {
  res.send('Note-Taking App Backend');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

process.on('SIGTERM', async () => {
  await client.close();
  process.exit(0);
});
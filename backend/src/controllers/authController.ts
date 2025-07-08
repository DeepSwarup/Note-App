import { Request, Response, RequestHandler, NextFunction } from 'express';
import { User, UserModel } from '../models/user';
import { client, transporter, SECRET_KEY } from '../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const userModel = new UserModel(client);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // callbackURL: 'http://localhost:5000/auth/google/callback',
      callbackURL: 'https://note-app-somf.onrender.com/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await userModel.findUserByEmail(profile.emails![0].value) || await userModel.findUserByGoogleId(profile.id);
        if (existingUser) {
          return done(null, existingUser);
        }
        const newUser: User = {
          email: profile.emails![0].value,
          name: profile.displayName,
          googleId: profile.id,
        };
        await userModel.createUser(newUser);
        return done(null, newUser);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email: string, done) => {
  const user = await userModel.findUserByEmail(email);
  done(null, user);
});

export const authenticateToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.cookies?.token;
  // console.log('Received token from header or cookie:', token);
  if (!token) {
    // console.error('No token provided');
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = await jwt.verify(token, SECRET_KEY) as JwtPayload;
    // console.log('Decoded token payload:', decoded);
    req.body = req.body || {};
    req.body.user = decoded;
    next();
  } catch (err) {
    // console.error('Token verification error:', (err as Error).message);
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
};

export const googleAuth: RequestHandler = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleCallback: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err) {
      // console.error('Google callback error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      // console.error('No user from Google auth:', info);
      return res.status(401).json({ error: 'Google authentication failed' });
    }
    const token = jwt.sign({ email: user.email, id: user._id || user.googleId, name: user.displayName }, SECRET_KEY, { expiresIn: '1h' });
    console.log('Generated new token:', token.substring(0, 10) + '... for user:', { email: user.email, id: user._id || user.googleId, name: user.displayName });
    res.clearCookie('token');
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000,
    });
    res.redirect('https://note-app-jet-eight.vercel.app/welcome');
  })(req, res, next);
};

export const getOtp: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { name, dateOfBirth, email } = req.body as { name: string; dateOfBirth: string; email: string };
    // console.log('Request body:', { name, dateOfBirth, email });
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      // console.log('Existing user found:', existingUser);
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await userModel.createUser({ name, dateOfBirth, email, otp, otpExpires });
    // console.log('User created with OTP:', otp);

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Your OTP for Signup',
      text: `Your OTP for signup is ${otp}. It is valid for 10 minutes.`,
    });

    // console.log(`OTP ${otp} sent to ${email}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    // console.error('Error in getOtp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const signup: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body as { email: string; otp: string };
    const user = await userModel.findUserByEmail(email);

    if (!user || !user.otp || !user.otpExpires || new Date() > user.otpExpires) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ error: 'Incorrect OTP' });
      return;
    }

    const token = jwt.sign({ email: user.email, id: user._id, name:user.name }, SECRET_KEY, { expiresIn: '1h' });
    await userModel.updateUser(email, { otp: undefined, otpExpires: undefined });

    res.status(200).json({ message: 'Signup successful', token });
  } catch (error) {
    // console.error('Error in signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLoginOtp: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };
    // console.log('Login OTP request for:', email);
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      res.status(400).json({ error: 'Email not registered' });
      return;
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await userModel.updateUser(email, { otp, otpExpires });

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Your OTP for Login',
      text: `Your OTP for login is ${otp}. It is valid for 10 minutes.`,
    });

    // console.log(`Login OTP ${otp} sent to ${email}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    // console.error('Error in getLoginOtp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body as { email: string; otp: string };
    const user = await userModel.findUserByEmail(email);

    if (!user || !user.otp || !user.otpExpires || new Date() > user.otpExpires) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ error: 'Incorrect OTP' });
      return;
    }

    const token = jwt.sign({ email: user.email, id: user._id, name:user.name }, SECRET_KEY, { expiresIn: '1h' });
    // console.log('Generated token for user:', { email: user.email, id: user._id }, 'Token:', token);
    await userModel.updateUser(email, { otp: undefined, otpExpires: undefined });

    // Set HTTP-only cookie and return token in response
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Set to true for HTTPS in production
      sameSite: 'none',
      maxAge: 3600000, // 1 hour
    });
    res.status(200).json({ message: 'Login successful', token }); // Return token for debugging
  } catch (error) {
    // console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout: RequestHandler = (req: Request, res: Response) => {
  try {
    res.clearCookie('token'); // Clear the HTTP-only cookie
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    // console.error('Error in logout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Keep other functions as they are
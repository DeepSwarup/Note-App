import { Request, Response, RequestHandler } from 'express';
import { client } from '../config';
import { authenticateToken } from './authController';
import { ObjectId } from 'mongodb';

type HandlerWithMiddleware = RequestHandler[] | RequestHandler;

export const getNotes: HandlerWithMiddleware = [
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.body.user.id;
      // console.log('Fetching notes for userId:', userId);
      const db = client.db('note-taking-app');
      const notes = await db.collection('notes').find({ userId }).toArray();
      // Fetch user details to get the name
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
      const name = user?.name || 'User'; // Fallback to 'User' if name is missing
      res.status(200).json({
        notes: notes.map(note => note.content),
        email: req.body.user.email,
        name, // Include the user's name
      });
    } catch (error) {
      // console.error('Error in getNotes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
];

// Keep other functions (addNote, deleteNote) as they are

export const addNote: HandlerWithMiddleware = [
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.user.id;
      const { content } = req.body;

      if (!content || typeof content !== 'string') {
        res.status(400).json({ error: 'Content is required and must be a string' });
        return;
      }

      // console.log('Adding note for userId:', userId, 'Content:', content);

      const db = client.db('note-taking-app');
      await db.collection('notes').insertOne({ userId, content, createdAt: new Date() });

      res.status(201).json({ message: 'Note added successfully' });
    } catch (error) {
      // console.error('Error in addNote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
];


export const deleteNote: HandlerWithMiddleware = [
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.body.user.id;
      const index = parseInt(req.params.id, 10);
      const db = client.db('note-taking-app');
      const notes = await db.collection('notes').find({ userId }).sort({ createdAt: -1 }).toArray(); // Sort by creation date
      if (index >= 0 && index < notes.length) {
        // console.log('Deleting note for userId:', userId, 'at index:', index);
        await db.collection('notes').deleteOne({ _id: notes[index]._id });
        res.status(200).json({ message: 'Note deleted successfully' });
      } else {
        res.status(400).json({ error: 'Invalid note index' });
      }
    } catch (error) {
      // console.error('Error in deleteNote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
];
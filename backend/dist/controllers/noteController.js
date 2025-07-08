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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.addNote = exports.getNotes = void 0;
const config_1 = require("../config");
const authController_1 = require("./authController");
const mongodb_1 = require("mongodb");
exports.getNotes = [
    authController_1.authenticateToken,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.body.user.id;
            // console.log('Fetching notes for userId:', userId);
            const db = config_1.client.db('note-taking-app');
            const notes = yield db.collection('notes').find({ userId }).toArray();
            // Fetch user details to get the name
            const user = yield db.collection('users').findOne({ _id: new mongodb_1.ObjectId(userId) });
            const name = (user === null || user === void 0 ? void 0 : user.name) || 'User'; // Fallback to 'User' if name is missing
            res.status(200).json({
                notes: notes.map(note => note.content),
                email: req.body.user.email,
                name, // Include the user's name
            });
        }
        catch (error) {
            // console.error('Error in getNotes:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }),
];
// Keep other functions (addNote, deleteNote) as they are
exports.addNote = [
    authController_1.authenticateToken,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.body.user.id;
            const { content } = req.body;
            if (!content || typeof content !== 'string') {
                res.status(400).json({ error: 'Content is required and must be a string' });
                return;
            }
            // console.log('Adding note for userId:', userId, 'Content:', content);
            const db = config_1.client.db('note-taking-app');
            yield db.collection('notes').insertOne({ userId, content, createdAt: new Date() });
            res.status(201).json({ message: 'Note added successfully' });
        }
        catch (error) {
            // console.error('Error in addNote:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }),
];
exports.deleteNote = [
    authController_1.authenticateToken,
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.body.user.id;
            const index = parseInt(req.params.id, 10);
            const db = config_1.client.db('note-taking-app');
            const notes = yield db.collection('notes').find({ userId }).sort({ createdAt: -1 }).toArray(); // Sort by creation date
            if (index >= 0 && index < notes.length) {
                // console.log('Deleting note for userId:', userId, 'at index:', index);
                yield db.collection('notes').deleteOne({ _id: notes[index]._id });
                res.status(200).json({ message: 'Note deleted successfully' });
            }
            else {
                res.status(400).json({ error: 'Invalid note index' });
            }
        }
        catch (error) {
            // console.error('Error in deleteNote:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }),
];

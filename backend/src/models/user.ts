import { MongoClient } from 'mongodb';

export interface User {
  _id?: string;
  name?: string;
  dateOfBirth?: string;
  email: string;
  otp?: string;
  otpExpires?: Date;
  googleId?: string; // Added for Google authentication
}

export class UserModel {
  private client: MongoClient;

  constructor(client: MongoClient) {
    this.client = client;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const db = this.client.db('note-taking-app');
    return await db.collection<User>('users').findOne({ email });
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    const db = this.client.db('note-taking-app');
    return await db.collection<User>('users').findOne({ googleId });
  }

  async createUser(user: User): Promise<void> {
    const db = this.client.db('note-taking-app');
    await db.collection<User>('users').insertOne(user);
  }

  async updateUser(email: string, updates: Partial<User>): Promise<void> {
    const db = this.client.db('note-taking-app');
    await db.collection<User>('users').updateOne({ email }, { $set: updates });
  }
}
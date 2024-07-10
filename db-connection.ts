import mongoose from 'mongoose';
import { DB_CONNECTION_STRING } from './utils/constants';

export async function connectToDatabase() {
  // Connect to the database 
  await mongoose.connect(DB_CONNECTION_STRING, {autoIndex: true});
}


import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()

const connectionString = process.env.DB_CONNECTION_STRING

export async function connectToDatabase() {
  // Connect to the databas with auto indexing for efficient querying
  await mongoose.connect(connectionString, {autoIndex: true});
}


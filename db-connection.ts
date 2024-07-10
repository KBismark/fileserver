import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()

const connectionString = process.env.DB_CONNECTION_STRING

export async function connectToDatabase() {
  // Connect to the database 
  await mongoose.connect(connectionString, {autoIndex: true});
}


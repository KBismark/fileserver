import {type Express} from 'express'
import mongoose from 'mongoose';
import {join} from 'path'
import { DB_CONNECTION_STRING, IS_DEVELOPMENT, PORT } from './utils/constants';

export const rootDir = join(__dirname, '')
export const publicContentDir = join(__dirname, IS_DEVELOPMENT? '/client/build' : '../client/build');
export const filesDir = join(__dirname, IS_DEVELOPMENT? '/files' : '../files');


 // Connect to the database 
export const connectToDatabase = async (app:Express)=>{
    if(ignoredbConncetion) return;
    try {
        const connection = await mongoose.connect(DB_CONNECTION_STRING, { autoIndex: true });
        // Start server after database connection
        app.listen(PORT, () => {
            console.log(`App successfully started!`);
        });
        return connection;
    } catch (err) {
        // Can't connect to database
        throw err;
    }
}

let ignoredbConncetion = false;
export const IgnoreDatabaseConnection = ()=> ignoredbConncetion=true;


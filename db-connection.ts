import mongoose from 'mongoose';
import {join} from 'path'
import { DB_CONNECTION_STRING, IS_DEVELOPMENT } from './utils/constants';

export const rootDir = join(__dirname, '')
export const publicContentDir = join(__dirname, IS_DEVELOPMENT? '/client/build' : '../client/build');
export const filesDir = join(__dirname, IS_DEVELOPMENT? '/files' : '../files');

 // Connect to the database 
export const databaseConnection =  mongoose.connect(DB_CONNECTION_STRING, {autoIndex: true});


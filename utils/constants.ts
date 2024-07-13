import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT||3034;
export const IS_DEVELOPMENT = process.env.ENV_STRING==='development';
export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;
export const JWT_SECRET = process.env.JWT_SECRET;
export const EMAIL_ACCOUNT = process.env.EMAIL_ACCOUNT;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const ADMIN_ACCOUNT = process.env.ADMIN_ACCOUNT;

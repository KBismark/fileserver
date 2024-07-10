import express from 'express'
import { authValidation, authenticateRequest } from '../../middleware';
import { Upload } from './Upload';
export const adminRouter = express.Router();

adminRouter.post('/upload',  authenticateRequest, Upload);



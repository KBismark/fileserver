import express from 'express'
import { authValidation, authenticateRequest, uploadValidation } from '../../middleware';
import { Upload } from './Upload';
export const adminRouter = express.Router();

adminRouter.post('/upload', uploadValidation, authenticateRequest, Upload);



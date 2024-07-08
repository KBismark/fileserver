import express from 'express'
import { authValidation, authenticateRequest } from '../../middleware';
import { Login } from './Login';
import { Signup } from './Signup';
import { Logout } from './Logout';
export const authRouter = express.Router();

authRouter.patch('/sign_in', authValidation, Login);
authRouter.post('/sign_up', authValidation, Signup);
authRouter.patch('/logout', authenticateRequest, Logout)


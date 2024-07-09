import express from 'express'
import { authValidation, authenticateRequest, emailValidation, emailVerificationValidation, passwordResetValidation } from '../../middleware';
import { Login } from './Login';
import { Signup } from './Signup';
import { Logout } from './Logout';
import { PasswordReset, PasswordResetPage, RequestPasswordReset, VerifyEmail } from './Password';
export const authRouter = express.Router();

authRouter.patch('/sign_in', authValidation, Login);
authRouter.post('/sign_up', authValidation, Signup);
authRouter.patch('/sign_out', authenticateRequest, Logout);
authRouter.put('/request_reset', emailValidation, RequestPasswordReset);
authRouter.patch('/reset', passwordResetValidation, PasswordReset);
authRouter.get('/reset', emailVerificationValidation, PasswordResetPage);
authRouter.get('/verify', emailVerificationValidation, VerifyEmail)


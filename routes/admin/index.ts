import express from 'express'
import { authValidation, authenticateRequest, emailValidation, emailVerificationValidation, passwordResetValidation } from '../../middleware';
export const adminRouter = express.Router();

// authRouter.patch('/sign_in', authValidation, Login);
// authRouter.post('/sign_up', authValidation, Signup);
// authRouter.patch('/sign_out', authenticateRequest, Logout);
// // Handles user request to reset password - sends reset link
// authRouter.put('/request_reset', emailValidation, RequestPasswordReset);
// // Serves password rest page
// authRouter.get('/reset', emailVerificationValidation, PasswordResetPage);
// // Handles password reset
// authRouter.patch('/reset', passwordResetValidation, PasswordReset);
// // Handle email verification
// authRouter.get('/verify', emailVerificationValidation, VerifyEmail)


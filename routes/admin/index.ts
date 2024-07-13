import express from 'express'
import { authenticateRequest } from '../../middleware';
import { Upload } from './Upload';
import { ADMIN_ACCOUNT } from '../../utils/constants';
export const adminRouter = express.Router();

// handle access to the admin page
adminRouter.get('/', authenticateRequest, (req, res)=>{
    if((req as any).user_authenticated){
        if((req as any).user_id!==ADMIN_ACCOUNT){
            // Only admin accounts get to access route: /admin
            return  res.clearCookie('auth', {path: '/'}).redirect('/');
        }
        // User is authenticated. Serve page
       return (req as any).serveBaseUrl(res)
    }
    res.redirect('/');
})

adminRouter.post('/upload',  authenticateRequest, Upload);



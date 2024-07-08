import { NextFunction, Request, Response } from 'express'
import { body, validationResult } from "express-validator";
import jwt from 'jsonwebtoken'
import { ReesponseCodes } from '../utils/response_codes';
import { TryCatch } from '@/utils/trycatch';
import { Users } from '@/models/Users';

export const authValidation = [
    body('email').isString().trim().toLowerCase().isEmail().isLength({min:3,max:150}).withMessage({field: 'email'}),
    body('password').isString().trim().toLowerCase().isLength({min:8,max:32}).withMessage({field: 'password'}),
    (req: Request, res: Response, next: NextFunction)=>{
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(ReesponseCodes.unathourized).end();
      }
      next();
    }
]

const expiry = 1000 * 60 * 20; // 20 minutes. Short expiry to keep user sessions
const long_expiry = 1000 * 60 * 60 * 24 * 7; // 7 days. Require mandatory re-login after 7 days of inactivity
const JWT_SECRET = process.env.JWT_SECRET;
export const authenticateRequest = async (req: Request, res: Response, next: NextFunction)=>{
  if(!req.cookies||!req.cookies.auth){
    return res.redirect('/');
  }

  jwt.verify(`${req.cookies.auth}`, JWT_SECRET, (err: any, {id, from}: {id: string, from: number}) => {
    if (err) {
      res.clearCookie('auth', {path: '/'});
      return res.redirect('/');
    }
    // Checks how long since last request to determine if we should re-validate user
    const expired = expiry <= (Date.now() - from);
    if(expired){
      return TryCatch(async ()=>{
        // Find out if user has logged out
        return await Users.findOne({_id: id, isIn: true});
      })
      .then(({result:user,errored})=>{
        if(user){ // User is not logged out
          
          console.log(user);

          // Sets userId for usage in subsequent middlewaress
          (req as any).user_id = user._id;

          return next(); // To the next midleware (User session extensions)
        }
         // User logged out or does not exist
         res.clearCookie('auth', {path: '/'});
         res.redirect('/');
      })
      .catch((err)=>{
        // Error occured during operations. Let's make user login again
        res.clearCookie('auth', {path: '/'});
        res.redirect('/');
      })
    }
    // Sets userId for usage in subsequent middlewaress
    (req as any).user_id = id;
    next(); // To the next midleware (User session extensions)
  });
}


export const extendUserSessions = (req: Request, res: Response, next: NextFunction)=>{
  const user_id = (req as any).user_id
  // User has not logged out yet. 
  // Refresh access tokens and extend inactivity expiry time
  const token = jwt.sign({ id: user_id, from: Date.now() }, JWT_SECRET);
  res.cookie('auth', token, { maxAge: long_expiry, path: '/'} as any);
  next() // To the next midleware 
}
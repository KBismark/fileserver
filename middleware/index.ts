import { NextFunction, Request, Response } from 'express'
import { body, validationResult, query } from "express-validator";
import jwt from 'jsonwebtoken'
import { ReesponseCodes } from '../utils/response_codes';
import { TryCatch } from '../utils/trycatch';
import { Users } from '../models/Users';
import { JWT_SECRET } from '../utils/index';

// Validates form inputs
export const authValidation = [
    body('email').isString().trim().toLowerCase().isEmail().isLength({min:3,max:100}).withMessage({field: 'email'}),
    body('password').isString().trim().toLowerCase().isLength({min:8,max:32}).withMessage({field: 'password'}),
    (req: Request, res: Response, next: NextFunction)=>{
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return setTimeout(() => {
          res.status(ReesponseCodes.unathourized).end();
        }, 3000);
      }
      next();
    }
];

export const emailValidation = [
  body('email').isString().trim().toLowerCase().isEmail().isLength({min:3,max:100}).withMessage({field: 'email'}),
  (req: Request, res: Response, next: NextFunction)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return setTimeout(() => {
        res.status(ReesponseCodes.unathourized).end();
      }, 3000);
    }
    next();
  }
]

export const emailVerificationValidation = [
  // The actual length of characters is unknown and varies
  // It certainly must not exceed 2000 characters
  query('r').isString().trim().isLength({min:3,max:2000}).withMessage({field: 'encodedData'}),
  (req: Request, res: Response, next: NextFunction)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      (req as any).request_validated = false;
      return next();
    }
    (req as any).request_validated = true;
    next();
  }
]

export const passwordResetValidation = [
  body('password').isString().trim().toLowerCase().isLength({min:8,max:32}).withMessage({field: 'password'}),
   // The actual length of characters is unknown and varies
  // However, it must not exceed 2000 characters
  body('check').isString().trim().isLength({min:3,max:2000}).withMessage({field: 'encodedData'}),
  (req: Request, res: Response, next: NextFunction)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return setTimeout(() => {
        res.status(ReesponseCodes.unathourized).end();
      }, 3000);
    }
    next();
  }
];

const expiry = 1000 * 60 * 20; // 20 minutes. Short expiry to keep user sessions
const long_expiry = 1000 * 60 * 60 * 24 * 7; // 7 days. Require mandatory re-login after 7 days of inactivity


export const authenticateRequest = async (req: Request, res: Response, next: NextFunction)=>{
  if(!req.cookies||!req.cookies.auth){
    (req as any).authenticated = false;
    return next()
  }
  
  // Uses JWT to encode user_id (email) and use encoded value to set the cookie
  jwt.verify(`${req.cookies.auth}`, JWT_SECRET, (err: any, {id, from}: {id: string, from: number}) => {
    if (err) {
      res.clearCookie('auth', {path: '/'});
      (req as any).user_authenticated = false;
      return next()
    }
    // Checks how long since last request to determine if we should re-validate user
    const expired = expiry <= (Date.now() - from);
    if(expired){
      return TryCatch(async ()=>{
        // Find out if user has logged out
        return await Users.findOne({_id: id, verified: true, isin: true});
      })
      .then(({result:user,errored})=>{
        if(user){ // User is not logged out
          
          // Sets userId for usage in subsequent middlewaress
          (req as any).user_id = user._id;
          (req as any).user_authenticated = true;
          extendUserSessions(req, res);
          return next(); // To the next midleware (User session extensions)
        }
         // User logged out or does not exist
         res.clearCookie('auth', {path: '/'});
         (req as any).user_authenticated = false;
         next()
      })
      .catch((err)=>{
        // Error occured during operations. Let's make user login again
        res.clearCookie('auth', {path: '/'});
        (req as any).user_authenticated = false;
        next()
      })
    }
    // Sets userId for usage in subsequent middlewaress
    (req as any).user_id = id;
    (req as any).user_authenticated = true;
    next(); // To the next midleware (User session extensions)
  });
}


 const extendUserSessions = (req: Request, res: Response)=>{
  const user_id = (req as any).user_id
  // User has not logged out yet. 
  // Refresh access tokens and extend inactivity expiry time
  const token = jwt.sign({ id: user_id, from: Date.now() }, JWT_SECRET);
  res.cookie('auth', token, { maxAge: long_expiry, path: '/'} as any);
}
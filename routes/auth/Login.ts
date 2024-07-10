import express, { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {Users, type UserType } from '../../models/Users'
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';
import { ADMIN_ACCOUNT, JWT_SECRET } from '../../utils/constants';

const expiry = 1000 * 60 * 60 * 24 * 7; // 7 days inactivity expiry


export const Login = async (request: Request,response: Response)=>{
    // Request body is validated to ensure email and password are in right formart
    let {email, password} = request.body;
    email = email.toLowerCase()
    
    let { result: user, errored } = await TryCatch(async ()=>{
      return await Users.findOne({_id: email, verified: true });
    });
    
    if(user){ // User exists
        // Compare passwords
        const authenticated = await bcrypt.compare(password, (user as any).password);
        if (!authenticated) {
            return respondToLoginUnSuccessful(response);
        }

        // Log user in after autehntication
        const { result: loggedIn } = await TryCatch(async ()=>{
            return await Users.findOneAndUpdate({_id: email, verified: true }, {is_in: true});
        });

        if(loggedIn){ // Log in successful
            // Encode user id for authenticatibg subsequent requests
            const token = jwt.sign({ id: (user as any)._id, from: Date.now() }, JWT_SECRET);
            response.cookie('auth', token, { maxAge: expiry, path: '/' } as any);
            // Send Sucess response
            return response.status(ReesponseCodes.ok).json({isAdmin: email===ADMIN_ACCOUNT});
        }
            
    }
    // Login was unsuccessful
    return respondToLoginUnSuccessful(response)

}

 // Responds in some seconds later. This is just to reduce robot (non-human) attempts
const respondToLoginUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 3000);
}



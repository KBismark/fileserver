import express, { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {Users, type UserType } from '../../models/Users'
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';

const expiry = 1000 * 60 * 60 * 24 * 7; // 7 days inactivity expiry
const JWT_SECRET = process.env.JWT_SECRET;


export const Login = async (request: Request,response: Response)=>{
    // Request body is validated to ensure email and password are in right formart
    let {email, password} = request.body;
    email = email.toLowerCase()
    
    let {result:user,errored} = await TryCatch(async ()=>{
      return await Users.findOneAndUpdate({_id: email}, {isin: !0});
    });
    console.log(user, errored)
    if(user){
        const authenticated = await bcrypt.compare(password, user.password);
        if (!authenticated) {
            return respondToLoginUnSuccessful(response);
        }

        const token = jwt.sign({ id: user._id, from: Date.now() }, JWT_SECRET);
        response.cookie('auth', token, { maxAge: expiry, path: '/' } as any);
      // Send Sucess response
      return response.status(ReesponseCodes.ok).end();
    }
    // Login was unsuccessful
    return respondToLoginUnSuccessful(response)

}

 // Responds in some seconds later. This is just to reduce robot (non-human) attempts
const respondToLoginUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 4000);
}



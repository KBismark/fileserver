import express, { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {Users, type UserType } from '../../models/Users';
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';
import { getVerificationCode, JWT_SECRET } from '../../utils/index';


export const Signup = async (request: Request,response: Response)=>{

    let { password, email} = request.body;
    email = email.toLowerCase();

    let {result:userExists,errored: err1} = await TryCatch(async ()=>{
        return await Users.findById(email);
    });
    
    if(userExists){
        return respondToSignupUnSuccessful(response)
    }


    if(err1){
        return respondToSignupUnSuccessful(response)
    }

    const verificationCode = getVerificationCode();
    const currentTime = Date.now();
    let {result:addedUser,errored} = await TryCatch(async ()=>{
      return  await Users.insertMany([
        {
            _id: email,
            password: await bcrypt.hash(password, 15),
            is_in: false,
            verified: false,
            last_verify_request: currentTime,
            verify_code: verificationCode
        }
      ])
    });

    if(addedUser&&addedUser.length>0&&addedUser[0]){
        const token = jwt.sign({ id: email, time: currentTime, code: verificationCode, requested: 0 }, JWT_SECRET);
        // Send email containing the verification link continue account creation 
        const link = `${request.protocol}://${request.get('host')}/auth/verify?r=${token}`

        // Send Sucess response
        return response.status(ReesponseCodes.created).end();
    }

     return respondToSignupUnSuccessful(response)
    
}


 // Responds in some seconds later. This is just to reduce robot (non-human) signup
 const respondToSignupUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 3000);
}


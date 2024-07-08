import express, { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import {Users, type UserType } from '../../models/Users';
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';


export const Signup = async (request: Request,response: Response)=>{

    // Decrypt password and check if it's correct
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

    let {result:addedUser,errored} = await TryCatch(async ()=>{
      return  await Users.insertMany([
        {
            _id: email.toLowerCase(),
            password: await bcrypt.hash(password, 15),
            isin: false,
        }
      ])
    });

    if(addedUser&&addedUser.length>0&&addedUser[0]){
        // Send Sucess response
        return response.status(ReesponseCodes.created).end();
    }

     return respondToSignupUnSuccessful(response)
    
}


 // Responds in some seconds later. This is just to reduce robot (non-human) signup
 const respondToSignupUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 4000);
}


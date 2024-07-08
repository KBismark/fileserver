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

    console.log(userExists, err1);
    
    if(userExists){
        return respondToSignupUnSuccessful(response)
    }

    console.log(1);

    if(err1){
        return respondToSignupUnSuccessful(response)
    }

    console.log(2)

    let {result:addedUser,errored} = await TryCatch(async ()=>{
      return  await Users.insertMany([
        {
            _id: email.toLowerCase(),
            password: await bcrypt.hash(password, 15),
            isin: false,
        }
      ])
    });

    console.log({addedUser,errored})
    if(addedUser){
        // Send Sucess response
        return response.status(ReesponseCodes.created).end();
    }

    console.log(2)

     return respondToSignupUnSuccessful(response)
    
}


 // Responds in some seconds later. This is just to reduce robot (non-human) signup
 const respondToSignupUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 4000);
}


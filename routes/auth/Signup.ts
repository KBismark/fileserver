import express, { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {Users, type UserType } from '../../models/Users';
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';
import { getVerificationCode, sendMail } from '../../utils/index';
import { JWT_SECRET } from '../../utils/constants';

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
        const link = `${request.protocol}://${request.get('host')}/auth/verify?r=${token}`;
        return sendMail({
            to: email,
            subject: 'FILE SERVER ACCOUNT VERIFICATION',
            html: `<body style="padding: 20px 10px;"><h2 style="color:rgb(30, 199, 72);">Hello Dear,</h2>`+
            `<p>Kindly click on the link below to verify your account.</p><a href="${link}">${link}</a>`+
            `<p>Please ignore if you did not request for this message.</p><br/><br/>Regards,<br/><br/>Bismark Yamoah`+
            `<br/>(Software Engineer)<br/><strong>KBismark Development</strong></body>`
        },(err, data)=>{
            if(err){
                return respondToSignupUnSuccessful(response)
            }
             // Send Sucess response
            response.status(ReesponseCodes.created).end();
        }) 
    }

     return respondToSignupUnSuccessful(response)
    
}


 // Responds in some seconds later. This is just to reduce robot (non-human) signup
 const respondToSignupUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 3000);
}


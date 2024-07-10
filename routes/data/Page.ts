
import express, { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {Users, type UserType } from '../../models/Users';
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';
import { getVerificationCode, sendMail } from '../../utils/index';
import { JWT_SECRET } from '../../utils/constants';

export type CardProps = {title: string; img: string; type?: 'image'|'doc', description: string}

export const PageData = async (request: Request,response: Response)=>{
    if(!(request as any).user_authenticated){
        return respondToUnSuccessful(response)
    }
    const user_id = (request as any).user_id ;

    response.status(ReesponseCodes.ok).json({email: user_id, content: []})
    
}


 // Responds in some seconds later. This is just to reduce robot (non-human) attempts
 const respondToUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 3000);
}





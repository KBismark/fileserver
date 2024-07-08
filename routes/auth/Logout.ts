import { NextFunction, Request, Response } from 'express'
import {Users, type UserType } from '../../models/Users'
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';


export const Logout = async (request: Request,response: Response)=>{
    const email = (request as any).user_id; // This value is taken from user's session data
    
    let {result:user,errored} = await TryCatch(async ()=>{
      return await Users.findOneAndUpdate({_id: email}, {isin: !!0});
    });
    console.log(user, errored)
    if(user){
        return response.clearCookie('auth', {path: '/'}).status(ReesponseCodes.ok).end()
    }
    // Login was unsuccessful
    return respondToLogoutUnSuccessful(response)

}

 // Responds in some seconds later. This is just to reduce robot (non-human) attempts
const respondToLogoutUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 4000);
}



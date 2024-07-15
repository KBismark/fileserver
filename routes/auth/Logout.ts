import { NextFunction, Request, Response } from 'express'
import {Users, type UserType } from '../../models/Users'
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';


export const Logout = async (request: Request,response: Response)=>{

    if(!(request as any).user_authenticated) { return respondToLogoutUnSuccessful(response) };

    const email = (request as any).user_id; // This value is taken from user's session data
    
    const { result: loggedOut } = await TryCatch(async ()=>{
      return await Users.findOneAndUpdate({_id: email, verified: true}, {is_in: false});
    });
    
    if(loggedOut){
        return response.clearCookie('auth', {path: '/'}).status(ReesponseCodes.okNoResponse).end()
    }
    // Logout was unsuccessful
    return respondToLogoutUnSuccessful(response)

}

 // Responds in some seconds later. This is just to reduce robot (non-human) attempts
const respondToLogoutUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 3000);
}



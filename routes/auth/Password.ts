import express, { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {Users, type UserType } from '../../models/Users';
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';
import { getVerificationCode, JWT_SECRET, sendMail } from '../../utils/index';

// route: PUT /auth/request_reset
export const RequestPasswordReset = async (request: Request,response: Response)=>{

    let { email } = request.body;
    email = email.toLowerCase();
    const verificationCode = getVerificationCode();
    const currentTime = Date.now();
    let {result:userExists,errored: err1} = await TryCatch(async ()=>{
        return await Users.findOneAndUpdate(
            {_id: email, verified: true}, 
            {last_verify_request: currentTime, verify_code: verificationCode }
        );
    });
    
    if(userExists){
        const token = jwt.sign({ id: email, time: currentTime, code: verificationCode, requested: 1 }, JWT_SECRET);
        // Send email containing the reset link continue password reset 
        const link = `${request.protocol}://${request.get('host')}/auth/reset?r=${token}`
        return sendMail({
            to: email,
            subject: 'PASSWORD RESET LINK',
            html: `<body style="padding: 20px 10px;"><h2 style="color:rgb(30, 199, 72);">Hello Dear,</h2>`+
            `<p>Kindly click on the link below to reset your password.</p><a href="${link}">${link}</a>`+
             `<p>Please ignore if you did not request for this message.</p><br/><br/>Regards,<br/><br/>Bismark Yamoah`+
             `<br/>(Software Engineer)<br/><strong>KBismark Development</strong></body>`
        },(err, data)=>{
            if(err){
                return respondToUnSuccessful(response);
            }
             // Send Sucess response
            response.status(ReesponseCodes.okNoResponse).end();
        }) 
    }

    return respondToUnSuccessful(response);
    
}

const verificationExpiry = 1000 * 60 * 15; // 15 minutes.

// route: GET /auth/verify
export const VerifyEmail = async (request: Request,response: Response)=>{

    if(!(request as any).request_validated){
        return response.send(`<body><h3>Verification link has expired.</h3></body>`);
    }

    let { r: encodedData } = request.query;
    jwt.verify(encodedData as string, JWT_SECRET, (err: any, {id, time, code, requested}: {id: string, time: number, requested: number, code: string}) => {
        if (
            err || typeof time !=='number' || typeof requested !=='number' ||
            !!requested /* Verification links were not requested */ ||
            typeof id !=='string' || typeof code !=='string'
        ) { 
          return response.send(`<body><h3>Verification link has expired.</h3></body>`)
        }

        // const expired = verificationExpiry <= (Date.now() - time);
        // if(expired){
        //     return response.send(`<body><h3>Verification link has expired.</h3></body>`);
        // }

        TryCatch(async ()=>{
            return await Users.findOneAndUpdate(
                {_id: id, verified: false, last_verify_request: time, verify_code: code, }, 
                {verify_code: '', is_in: false, verified: true, }
            );
        })
        .then(({result: successful})=>{
            if(successful){
                return response.send(`
                    <body>
                        <h3>
                            Email verification successful. 
                            Please <a href="${request.protocol}://${request.get('host')}/">log in</a> to your account.
                        </h3>
                    </body>
                `);
            }
            response.send(`<body><h3>Verification link has expired.</h3></body>`);
        })
        .catch((err)=>{
            return response.send(`<body><h3>Verification link has expired.</h3></body>`);
        })

    })
}

// route: GET /auth/reset
export const PasswordResetPage = async (request: Request,response: Response)=>{

    if(!(request as any).request_validated){
        return response.send(`<body><h3> The link has expired.</h3></body>`)
    }

    let { r: encodedData } = request.query;
    jwt.verify(encodedData as string, JWT_SECRET, (err: any, {id, time, code, requested}: {id: string, time: number, requested: number, code: string}) => {
        if (
            err || typeof time !=='number' || typeof requested !=='number' ||
            !requested /* Password reset links were requested */ ||
            typeof id !=='string' || typeof code !=='string'
        ) { 
          return response.send(`<body><h3> The link has expired.</h3></body>`)
        }

        const expired = verificationExpiry <= (Date.now() - time);
        if(expired){
            return response.send(`<body><h3>The link has expired.</h3></body>`);
        }

        
        // Serve page
        response.clearCookie('auth', {path: '/'});
        (request as any).serveBaseUrl(response);

    })
};

// route: PATCH /auth/reset
export const PasswordReset = async (request: Request,response: Response)=>{

    let { check: encodedData, password: newPassword } = request.body;

    //Decode user data and reset password
    jwt.verify(encodedData as string, JWT_SECRET, (err: any, {id, time, code, requested}: {id: string, time: number, requested: number, code: string}) => {
        if (
            err || typeof time !=='number' || typeof requested !=='number' ||
            !requested /* Password reset links were requested */ ||
            typeof id !=='string' || typeof code !=='string'
        ) { 
          return respondToUnSuccessful(response)
        }

        const expired = verificationExpiry <= (Date.now() - time);
        if(expired){
            return respondToUnSuccessful(response)
        }

        return TryCatch(async ()=>{
            return await Users.findOneAndUpdate(
                {_id: id, verified: true, last_verify_request: time, verify_code: code, }, 
                {verify_code: '', is_in: false, password: await bcrypt.hash(newPassword, 15), }
            );
        })
        .then(({result: successful})=>{
            if(successful){
                // Send Sucess response
                return response.status(ReesponseCodes.created).end();
            }
            return respondToUnSuccessful(response)
        })
        .catch((err)=>{
            return respondToUnSuccessful(response)
        })

    })
}

 // Responds in some seconds later. This is just to reduce robot (non-human) attempt
 const respondToUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 3000);
}


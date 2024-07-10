import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EMAIL_ACCOUNT, EMAIL_PASSWORD } from './constants';

// Returns 6-character random number 
export const getVerificationCode = ()=>`${Math.random()}`.slice(2,8)

const emailService = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_ACCOUNT,
        pass: EMAIL_PASSWORD
    }
});

export const sendMail = (options: Omit<Mail<any>['options'], 'from'>, cb: (err: Error, data: SMTPTransport.SentMessageInfo)=>void )=>{
  emailService.sendMail( {...options, from: EMAIL_ACCOUNT }, cb);
}




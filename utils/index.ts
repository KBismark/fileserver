import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_ACCOUNT = process.env.EMAIL_ACCOUNT;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

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




import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer';
import {GridFsStorage} from 'multer-gridfs-storage';
import {Users, type UserType } from '../../models/Users';
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';
import { getVerificationCode, sendMail } from '../../utils/index';
import { DB_CONNECTION_STRING } from '../../utils/constants';



const storage = new GridFsStorage({
  url: DB_CONNECTION_STRING,
  file: (request, file) => {
    const random = `${Math.random()}`.slice(3);
    const filename = `${random}${Date.now()}`
    return {      
        bucketName: 'files', // Collection's name 
        filename: filename,
        contentType: file.mimetype,
        metadata: {
            type: file.mimetype,
            name: filename
        }
    }
  }
});

// Configure multer with file size limit
const uploadFile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 megabytes limit in size
}).single('file');


export const Upload = (request: Request, response: Response)=>{
    if(!(request as any).user_authenticated) { return respondToUnSuccessful(response) };
    uploadFile(request, response, (err:any)=>{
        if(err){
            return response.status(ReesponseCodes.badRequest).end()
        }

    })
};

const respondToUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 3000);
}
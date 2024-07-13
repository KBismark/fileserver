import express, { NextFunction, Request, Response } from 'express'
import {join} from 'path'
import {unlink} from 'fs'
import mongoose from 'mongoose'
import multer from 'multer';
import {GridFsStorage} from 'multer-gridfs-storage';
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';
import { getVerificationCode, sendMail } from '../../utils/index';
import { DB_CONNECTION_STRING, IS_DEVELOPMENT } from '../../utils/constants';
import { databaseConnection, publicContentDir, rootDir } from '../../db-connection';
import { Uploader } from '../../models/Content'


// Use file storage for storing files
const storage = multer.diskStorage({
  destination: join(rootDir, '/files'),
  filename(req, file, callback) {
    const random = `${Math.random()}`.slice(3);
    const filename = `${random}${Date.now()}`;
    const extension = file.mimetype.split('/').pop().toLowerCase();
    (req as any).extension = extension;
    (req as any).filename = filename;
    (req as any).type = file.mimetype.startsWith('image')?'image':'doc',
    callback(null, `${filename}.${extension}`)
  },
})

// Configure multer with file size limit
const uploadFile = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 } // 6 megabytes limit in size
}).single('file');


export const Upload = (request: Request, response: Response)=>{
    if(!(request as any).user_authenticated) { return respondToUnSuccessful(response) };
    uploadFile(request, response, async (err:any)=>{
        if(err){
            return response.status(ReesponseCodes.badRequest).end()
        }
        // Validate form fields
        if(
          typeof request.body.title!=='string'||
          request.body.title.length>100||
          request.body.title.length<1||
          typeof request.body.description!=='string'||
          request.body.description.length>2000||
          request.body.description.length<1
        ){
          // Delete file since request source can't be trusted
          unlink(join(rootDir, `/files/${(request as any).filename}.${(request as any).extension}`),(err)=>{/* Couldn't delete file from system */})
          return respondToUnSuccessful(response)
        }

        let {result: successful, errored} = await TryCatch(async ()=>{
          return await Uploader.insertMany([
            {
              _id: (request as any).filename,
              suffix: (request as any).extension,
              description: request.body.description,
              title: request.body.title,
              downloadCount: 0,
              shareCount: 0,
              type: (request as any).type,
              time: Date.now()
            }
          ])
        });
        
        if(successful&&successful.length>0&&successful[0]){
          response.status(ReesponseCodes.created).end()
        }else{
          response.status(ReesponseCodes.notFound).end();
          // Delete file since operations were not complete
          unlink(join(rootDir, `/files/${(request as any).filename}.${(request as any).extension}`),(err)=>{/* Couldn't delete file from system */})
        }
    })
};

const respondToUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 3000);
}

// Store file in db
const uploadToDatabase = ()=>{
  const storage = new GridFsStorage({
    //   url: DB_CONNECTION_STRING,
    file: (request, file) => {
      const random = `${Math.random()}`.slice(3);
      const filename = `${random}${Date.now()}`
      return {      
          bucketName: 'files', // Collection's name 
          filename: filename,
          contentType: file.mimetype,
          id: filename,
          metadata: {
              type: /^(image)/.test((file.mimetype as string))?'image':'doc',
              name: filename,
              title: (request.body as any).title,
              description: (request.body as any).description,
          }
      }
    },
    db: databaseConnection
  });
}
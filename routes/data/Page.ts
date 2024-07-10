
import { NextFunction, Request, Response } from 'express'
import { TryCatch } from '../../utils/trycatch';
import { ReesponseCodes } from '../../utils/response_codes';
import { Uploader } from '../../models/Content';

export const PageData = async (request: Request,response: Response)=>{
    if(!(request as any).user_authenticated){
        return respondToUnSuccessful(response)
    }
    const user_id = (request as any).user_id ;

    const {result: contents, errored} = await TryCatch(async ()=>{
        return await Uploader.find({}, {time: 0}, {lean: true, limit: 30})
    })
    if(contents&&contents.length>0){
        return response.status(ReesponseCodes.ok).json({email: user_id, content: contents.map((data)=>{
            return {
                id: data._id,
                downloadCount: data.downloadCount,
                shareCount: data.shareCount,
                description: data.description,
                title: data.title,
                img: `${request.protocol}://${request.get('host')}/files/${data._id}.${data.suffix}`,
                type: data.type
            }
        })})
    }
    
    response.status(ReesponseCodes.notFound).end()
}


 // Responds in some seconds later. This is just to reduce robot (non-human) attempts
 const respondToUnSuccessful = (response: Response)=>{
    setTimeout(() => {
        response.status(ReesponseCodes.badRequest).end()
    }, 3000);
}





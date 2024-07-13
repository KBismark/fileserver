import {readdirSync} from 'fs'
import express, {Response} from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import morgan from 'morgan'
import {join} from 'path'
import {createWriteStream} from 'fs'
import { authRouter } from './routes/auth';
import { authenticateRequest } from './middleware';
import { PageData } from './routes/data/Page';
import { adminRouter } from './routes/admin';
import { ADMIN_ACCOUNT, IS_DEVELOPMENT, PORT } from './utils/constants';
import { databaseConnection, filesDir, publicContentDir, rootDir } from './db-connection';
import { ReesponseCodes } from './utils/response_codes';
import { TryCatch } from './utils/trycatch';
import { Uploader } from './models/Content';
import { sendMail } from './utils';


// App exported 
export const app = express();
// Handle CORS
app.use(cors());
// Parse cookies
app.use(cookieParser());
// Compress large files for easy download
app.use(compression())
// Parse JSON resposes
app.use(express.json())
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Logs application access to a log.txt file
const writableStream = createWriteStream(join(__dirname, '/logs.txt'), { flags: 'a' });
app.use([
    '/auth/:route', '/content', 
    '/resource/:route', '/admin/:route',
    '/files'
], morgan('combined', { stream: writableStream }));


const serveBaseUrl = (res: any)=>{
    // res.setHeader('Cache-Control', 'public, max-age=10800'); // Cache for 3 hours 
    res.sendFile(join(publicContentDir, '/index.html'));
}

// Mount entry path on route
app.get('/', authenticateRequest, (req, res)=>{
    if((req as any).user_authenticated){
         // User is authenticated. Redirect to content page
        return res.redirect('/content?r=0');
    }
    serveBaseUrl(res)
});

app.get(['/auth/reset','/admin'],(req, res, next)=>{
    // Serves reset page
    (req as any).serveBaseUrl = serveBaseUrl;
   next();
})

// handle access to the content page
app.get('/content', authenticateRequest, (req, res)=>{
    if((req as any).user_authenticated){
        // User is authenticated. Serve page
       return serveBaseUrl(res)
    }
    res.redirect('/');
})

// Serve the downloadable files
app.get('/download/:filename', (req, res)=>{
    const filename = req.params.filename;
    // Serve file to be downloaded
    return res.download(join(filesDir, `/${filename}`), filename, (err) => {
        if (err) {
            return res.status(ReesponseCodes.notFound).end();
        }
    });
    
})

// Update file download count and return current counts
app.get('/file_count/download/:file_id', authenticateRequest, async (req, res)=>{
    if((req as any).user_authenticated){
        const file_id = req.params.file_id;
        const {result, errored} = await TryCatch(async ()=>{
            return await Uploader.findOneAndUpdate(
                {_id: file_id }, 
                { $inc: {downloadCount: 1}}, 
                {new: true, projection: {shareCount: 1, downloadCount: 1} }
            )
        });
        if(result){
            return res.status(ReesponseCodes.created).json(result);
        }
        return res.status(ReesponseCodes.notFound).end();
    }
    return res.status(ReesponseCodes.badRequest).end();
});

// Update fileshare count and return current counts
app.get('/file_count/share/:file_id/:email', authenticateRequest, async (req, res)=>{
    if((req as any).user_authenticated){
        const user_id = (req as any).user_id;
        const file_id = req.params.file_id;
        const email = req.params.email;
        const {result, errored} = await TryCatch(async ()=>{
            return await Uploader.findOneAndUpdate(
                {_id: file_id }, 
                { $inc: {shareCount: 1}}, 
                {new: true, projection: {shareCount: 1, downloadCount: 1, suffix: 1} }
            )
        });
        if(result){
            res.status(ReesponseCodes.created).json(result);
            // Send email containing the link to download the file
            const link = `${req.protocol}://${req.get('host')}/download/${file_id}.${(result as any).suffix}?r=email`;
            return sendMail({
                to: email,
                subject: 'FILESERVER - SHARED FILE',
                html: `<body style="padding: 20px 10px;"><h2 style="color:rgb(30, 199, 72);">Hello Dear,</h2>`+
                `<p>Someone (${user_id}) shared a file with you. Click on the link below to access it. </p><a href="${link}">${link}</a>`+
                `<br/><br/>Regards,<br/><br/>Bismark Yamoah`+
                `<br/>(Software Engineer)<br/><strong>KBismark Development</strong></body>`
            },(err, data)=>{
                if(err){}
            }); 
        }
        return res.status(ReesponseCodes.notFound).end();
    }
    return res.status(ReesponseCodes.badRequest).end();
})

// Get data to populate content page
app.get('/resource/data', authenticateRequest, PageData)

// serve files as static contents
app.use('/files', express.static(filesDir));

// serve static files
app.use('/', express.static(publicContentDir));

// Mount authentication route
app.use('/auth', authRouter);

// Mount adim route
app.use('/admin', adminRouter);

// Handle errors passed by express
app.use((err:any, req:any, res: Response, next:any)=>{
    res.status(ReesponseCodes.notFound).end()
})

// Start server after database connection
databaseConnection.then((connection)=>{
    app.listen(PORT, ()=>{
        console.log(`App successfully started!`);
    })
})
.catch((err)=>{
    // Can't connect to database
    throw err;
})

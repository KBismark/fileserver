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
import { databaseConnection, publicContentDir } from './db-connection';
import { ReesponseCodes } from './utils/response_codes';


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
app.use(['/auth/:route', '/content', '/resource/:route', '/admin/:route'], morgan('combined', { stream: writableStream }));


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

app.get(['/auth/reset'],(req, res, next)=>{
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

// handle access to the admin page
app.get('/admin', authenticateRequest, (req, res)=>{
    if((req as any).user_authenticated){
        if((req as any).user_id!==ADMIN_ACCOUNT){
            // Only admin accounts get to access route: /admin
            return  res.clearCookie('auth', {path: '/'}).redirect('/');
        }
        // User is authenticated. Serve page
       return serveBaseUrl(res)
    }
    res.redirect('/');
})

app.get('/resource/data', authenticateRequest, PageData)

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

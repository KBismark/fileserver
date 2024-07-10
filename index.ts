import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import morgan from 'morgan'
import {join} from 'path'
import {createWriteStream} from 'fs'
import { connectToDatabase } from './db-connection';
import { authRouter } from './routes/auth';
import { authenticateRequest } from './middleware';
import { PageData } from './routes/data/Page';
import { adminRouter } from './routes/admin';
import { IS_DEVELOPMENT, PORT } from './utils/constants';


const publicContentDir = join(__dirname, IS_DEVELOPMENT? '/client/build' : '../client/build')

// App and server exported for testing purpose
export const app = express();
// Handle CORS
app.use(cors());
// Parse cookies
app.use(cookieParser());
// Compress large files for easy download
app.use(compression())
// Pares JSON resposes
app.use(express.json())

// Logs application access to a log.txt file
const writableStream = createWriteStream(join(__dirname, '/logs.txt'), { flags: 'a' });
app.use(['/auth/:route', '/content', '/resource/:route'], morgan('combined', { stream: writableStream }));


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

app.get('/resource/data', authenticateRequest, PageData)

// serve static files
app.use('/', express.static(publicContentDir));

// Mount authentication route
app.use('/auth', authRouter);

// Mount adim route
app.use('/admin', adminRouter);

// handle access to the content page
app.get('/content', authenticateRequest, (req, res)=>{
    if((req as any).user_authenticated){
        // User is authenticated. Serve page
       return serveBaseUrl(res)
    }
    res.redirect('/');
})


startApp(); // Starts the server
function startApp(){
    connectToDatabase().then((response)=>{
        app.listen(PORT, ()=>{
            console.log(`App successfully started!`);
            
        })
    }).catch((error)=>{
        // Can't connect to database
        console.log(error);
        
    })
}





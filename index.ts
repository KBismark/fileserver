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

const PORT = process.env.PORT||3034;

const app = express();
// Handle CORS
app.use(cors());
// Parse cookies
app.use(cookieParser());
// Compress large files for easy download
app.use(compression())
// Pares JSON resposes
app.use(express.json())

// Logs applications access to a log.txt file
const writableStream = createWriteStream(join(__dirname, '/logs.txt'), { flags: 'a' });
app.use(['/auth/:route', '/content'], morgan('combined', { stream: writableStream }));


const serveBaseUrl = (res: any)=>{
    // res.setHeader('Cache-Control', 'public, max-age=10800'); // Cache for 3 hours 
    res.sendFile(join(__dirname, '/client/build', '/index.html'));
}
app.get(['/auth/reset'],(req, res, next)=>{
     // Serve base index file
     (req as any).serveBaseUrl = serveBaseUrl;
    next();
})

// Mount entry path on route
app.get('/', authenticateRequest, (req, res)=>{
    if((req as any).user_authenticated){
         // User is authenticated. Redirect to content page
        return res.redirect('/content?r=0');
    }
    serveBaseUrl(res)
})

// serve static files
app.use('/', express.static(join(__dirname, '/client/build')));

// Mount authentication route
app.use('/auth', authRouter);

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





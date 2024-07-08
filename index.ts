import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectToDatabase } from './db-connection';
import { authRouter } from './routes/auth';

const PORT = process.env.PORT||3034;

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json())

app.use('/auth', authRouter);

app.get(['/', '/sign_up', '/sign_in','/admin', '/content'], (req, res)=>{

})

startApp(); // Starts the server
function startApp(){
    connectToDatabase().then((response)=>{
        app.listen(PORT, ()=>{
            console.log(`App successfully started!`);
            
        })
    }).catch((error)=>{
        // Can't connect to database

    })
}





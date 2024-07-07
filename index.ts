import express from 'express';
import { connectToDatabase } from './db-connection';

const app = express()
startApp(); // Starts the server

function startApp(){
    connectToDatabase().then((response)=>{
        app.listen(process.env.PORT||3034, ()=>{
            console.log(`App successfully started!`);
            
        })
    }).catch((error)=>{
        // Can't connect to database

    })
}





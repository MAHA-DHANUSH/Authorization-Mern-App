import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import connect from './database/conn.js'
import router from "./router/route.js"
const app=express()

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
}))
app.use(morgan('tiny')) //tiny format
app.disable('x-powered-by')


const port=8080;

// http get req
app.get('/',(req,res)=>{
    res.status(201).json('HOME GET Request')
});

//api routes

app.use("/api",router)

//start server
connect().then(()=>{
    try {
        app.listen(port,()=>{
            console.log(`server connected to http://localhost:${port}`);
        })     
    } catch (error) {
        console.log("cannot connect to the server")
    }
}).catch(error=>{
    console.log("Invalid database connection")
})


import nodemailer from 'nodemailer';
import Mailgen from 'mailgen'

import ENV from "../config.js"

let nodeConfig={
    host:"smtp.ethereal.email",
    port:587,
    secure:false,
    auth:{
        user:ENV.EMAIL,
        pass:ENV.PASSWORD
    }
}

let transporter=nodemailer.createTransport(nodeConfig);

let MailGenerator=new Mailgen({
    theme:"default",
    product:{
        name:"Mailgen",
        link:'https://mailgen.js/'
    }
})

//post:http://localhost:8080/api/registerMail
// "username",
// "userEmail",
// "text",
// "subject"
export const regiserMail=async(req,res)=>{
    const {username,userEmail,text,subject}=req.body

    //body of email
    var email={
        body:{
            name:username,
            intro:text||'welcome to dhanush.js',
            outro:'need help'
        }
    }
    var emailBody=MailGenerator.generate(email);

    let message={
        from:ENV.EMAIL,
        to:userEmail,
        subject:subject||"Signup Successfull",
        html:emailBody
    }
    //send mail
    transporter.sendMail(message)
    .then(()=>{
        return res.status(200).send({msg:"You should receive an email from us.."})
    })
    .catch(error=>res.status(500).send({error}))
}
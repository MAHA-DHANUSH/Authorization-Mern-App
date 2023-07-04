import UserModel from "../model/User.model.js";
import bcrypt from 'bcrypt';
import jwt  from 'jsonwebtoken'
import ENV from "../config.js"
import otpGenerator from "otp-generator"

//middleware to verify user
export async function verifyUser(req,res,next)
{
    try{
      const {username}=req.method=="GET"?req.query: req.body
      //check user existance
      let exist=await UserModel.findOne({username})
      if(!exist) return res.status(404).send({error:"Cant find user!"})
      next()

    }catch(error){
        return res.status(404).send({error:"Authentication Error"})
    }   
}

// {
//     "username":"example123",
//     "password":"admin123",
//     "email":"example@gmail.com",
//     "profile": ""
// }

export async function register(req, res) {
  try {
    const { username, password, email, profile } = req.body;

    // Check for existing username
    const existUsername = UserModel.findOne({ username }).exec();

    // Check for existing email
    const existEmail = UserModel.findOne({ email }).exec();

    Promise.all([existUsername, existEmail])
      .then(([usernameExists, emailExists]) => {
        if (usernameExists) {
          throw { error: "Please use a unique username" };
        }
        if (emailExists) {
          throw { error: "Please use a unique email" };
        }

        if (password) {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              const user = new UserModel({
                username,
                password: hashedPassword,
                profile: profile || '',
                email,
              });

              // Save the user and send the response
              user.save()
                .then((result) =>
                  res.status(201).json({ msg: "User registered successfully" })
                )
                .catch((error) =>
                  res.status(500).json({ error: error.message })
                );
            })
            .catch((error) => {
              return res.status(500).json({ error: "Unable to hash password" });
            });
        }
      })
      .catch((error) => {
        return res.status(500).json({ error: error.error });
      });
  } catch (error) {
    return res.status(500).json({ error: error.error });
  }
}

//post-login
//     "username":"example123",
//     "password":"admin123",

export async function login(req,res){
   const {username,password}=req.body;

   try {
    UserModel.findOne({ username })
    .then(user=>{
        bcrypt.compare(password,user.password)
        .then(passwordCheck=>{
            if(!passwordCheck) return res.status(400).send({error:"Dont have password"})

            //create jwt token
           const token=jwt.sign({
                userId:user._id,
                username:user.username
            },ENV.JWT_SECRET,{expiresIn:"24h"})

            return res.status(200).send({
                msg:"Login successfull",
                username:user.username,
                token
            })
        })
        .catch(error=>{
            return res.status(400).send({error:"Password does not match"})
        })
    })
    .catch(error=>{
        return res.status(404).send({error:"Username not found"})
    })
   } catch (error) {
    return res.status(500).send({error})
   }
}


export async function getUser(req, res) {
    const { username } = req.params;
  
    try {
      if (!username) return res.status(400).send({ error: "Invalid username" });
  
      const user = await UserModel.findOne({ username }).exec();
  
      if (!user) return res.status(404).send({ error: "Could not find user" });
        //remove password from user
        //mongoose return unnecessary data with objectr so convert to json
      const {password,...rest}=Object.assign({}, user.toJSON());
  
      return res.status(201).send(rest);
    } catch (error) {
      return res.status(500).send({ error: "Cannot find user data" });
    }
  }
  

  export async function updateUser(req, res) {
    try {
      //const  id  = req.params.id;
      const {userId}=req.user

      if (userId) {
        const body = req.body;
  
        // Update the data
        UserModel.updateOne({ _id:userId}, body)
          .exec()
          .then(() => {
            return res.status(201).send({ msg: "Record Updated...!" });
          })
          .catch((err) => {
          return res.status(401).send({error:"error"})
          });
      } else {
        return res.status(401).send({ error: "User Not Found...!" });
      }
    } catch (error) {
      return res.status(500).json({ error:"error in this" });
    }
  }

  

//get
export async function generateOTP(req,res){
   req.app.locals.OTP=await otpGenerator.generate(6,{lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false})
   res.status(201).send({code:req.app.locals.OTP})
}

//get
export async function verifyOTP(req,res){
    const {code}=req.query;
    if(parseInt(req.app.locals.OTP)==parseInt(code))
    {
      req.app.locals.OTP=null;
      req.app.locals.resetSession=true;

      return res.status(201).send({msg:'Verify successfully'})
    }
    return res.status(400).send({error:"Invalid OTP"})
}


export async function createResetSession(req,res){
    if(req.app.locals.resetSession)
    {
      
      return res.status(201).send({msg:"access granted!"})
    }
    return res.status(440).send({error:"Session expired"})
}
export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession) {
      return res.status(440).send({ error: "Session expired!" });
    }

    const { username, password } = req.body;

    try {
      const user = await UserModel.findOne({ username });

      if (!user) {
        return res.status(404).send({ error: "Username not found" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await UserModel.updateOne({ username: user.username }, { password: hashedPassword });

      req.app.locals.resetSession = false; // reset session

      return res.status(201).send({ msg: "Record Updated...!" });
    } catch (error) {
      return res.status(500).send({ error });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}

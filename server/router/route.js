import {Router} from "express"
const router=Router()

//import all controllers
import * as controller from "../controllers/appController.js"
import {regiserMail} from "../controllers/mailer.js"
import Auth,{localVariables} from "../middleware/auth.js"


//post method
router.route('/register').post(controller.register)
router.route('/registerMail').post(regiserMail) //send mail
router.route('/authenticate').post(controller.verifyUser,(req,res)=>res.end()) //authenticate user
router.route('/login').post(controller.verifyUser,controller.login) //login


//get method
router.route('/user/:username').get(controller.getUser) //user with username
router.route('/generateOTP').get(controller.verifyUser,localVariables,controller.generateOTP) //generate random otp
router.route('/verifyOTP').get(controller.verifyOTP) //verify generated otp
router.route('/createResetSession').get(controller.createResetSession) //reset al variables

//put method
router.route('/updateuser/:id').put(Auth,controller.updateUser) //update user profile/detail
router.route('/resetPassword').put(controller.verifyUser,controller.resetPassword) //used to reset password


export default router;
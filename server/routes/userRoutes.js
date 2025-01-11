import express from 'express'
import {registerUser,loginUser, userCredits, paymentStrip,verifyStrip} from '../controller/userController.js'
import userAuth from '../middlewares/auth.js'

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/credits',userAuth,userCredits)
userRouter.post('/pay-stripe',userAuth,paymentStrip)
userRouter.post('/verify',userAuth,verifyStrip)

export default userRouter
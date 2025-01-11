import userModel from "../models/userModels.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Stripe from "stripe";
import transactionModel from "../models/transactionModel.js";

const registerUser = async (req,res)=>{
    try {
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.json({success:false,message:'Missing Details'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)


        res.json({success:true,token,user: {name:user.name}})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
        
    }
}

const loginUser = async(req,res)=>{
    try {
        const {email,password}= req.body;
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message:'User does not exist'})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true,token,user: {name:user.name}})
        }else{
            return res.json({success:false,message:'Invalid credentials'})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

const userCredits = async (req,res)=>{
    try {
        const {userId} = req.body
        const user = await userModel.findById(userId)
        res.json({success:true,credits:user.creditBalance,user:{name:user.name}})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}



const paymentStrip = async (req, res) => {
    try {
        const { userId, planId } = req.body;
        const stripe = new Stripe(process.env.SECRET_KEY);

        if (!userId || !planId) {
            return res.json({ success: false, message: 'Missing Details' });
        }

        let credits, plan, amount;

        switch (planId) {
            case 'Basic':
                plan = 'Basic';
                credits = 100;
                amount = 1000; 
                break;

            case 'Advanced':
                plan = 'Advanced';
                credits = 500;
                amount = 5000;
                break;

            case 'Business':
                plan = 'Business';
                credits = 5000;
                amount = 2500;
                break;

            default:
                return res.json({ success: false, message: 'Plan not found' });
        }

        const transactionData = {
            userId,
            plan,
            amount,
            credits,
            date: Date.now(),
        };

        const newTransaction = await transactionModel.create(transactionData);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: process.env.CURRENCY, 
                        product_data: {
                            name: `${plan} Plan`, 
                            description: `${credits} credits`,
                            
                        },
                        unit_amount: amount * 100, 
                        
                    },
                    quantity: 1,
                },
            ],
            
            client_reference_id: userId, 
            success_url: `${process.env.CLIENT_URL}/buy`,
            cancel_url: `${process.env.CLIENT_URL}/buy`,
        });

        res.json({ success: true, url: session ,credits:credits});
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};



const verifyStrip = async (req,res) =>{
    try {
        const {userId,credits} = req.body;
        const updatedUser = await userModel.findByIdAndUpdate(
            userId, 
            { $inc: { creditBalance: credits } },
            { new: true } 
        );
        res.json({ success: true, data: updatedUser }); 
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


export {registerUser,loginUser,userCredits,paymentStrip,verifyStrip}
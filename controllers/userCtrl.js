const bcrypt = require('bcrypt')
const Users = require('../models/userModel')
const jwt = require('jsonwebtoken');
const { findById } = require('../models/userModel');
const userCtrl={
     registerUser: async (req,res)=>{
            try{
                const {username , email , password} = req.body;
                const user =await Users.findOne({email: email})
                if(user) return res.status(400).json({msg:"this email already exists. "});
                const passwordhash = await bcrypt.hash(password,10);
               
               const newUser = new Users({
                   username:username,
                   email: email,
                   password:passwordhash
               })
               await newUser.save()
               res.json({msg:"sign Up success"})
            }
            catch(err){
                   return res.status(500).json({msg: err.message})
            }
           
      } ,

     loginUser:async (req,res)=>{
         try{
            const { email ,password }=req.body;
            const user = await Users.findOne({email:email})
            if(!user) res.status(400).json({msg:"email doesn't exist. "});
            
            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg:"Incorrect Password"})

            // If login success create token
            const payload = {id: user._id, name: user.username}
            const token=jwt.sign(payload,process.env.TOKEN_SECRET,{expiresIn:"1d"})
          
            res.json({token})
         }
         catch(err){
             return res.status(500)
         }
     }
     ,
     verifiedToken: (req,res)=>{
         try{
            const token  = req.header('Authorization')
            if(!token) return res.send(false)

            jwt.verify(token,process.env.TOKEN_SECRET,async (err,verified)=>{
                if(err) return res.send(false)

                const user = await Users.findById(verified.id)
                if(!user){
                    return res.send(false)
                }
                res.send(true)
            })
         }
         catch(err){
           return res.status(500).json({msg:err.message})
         }
     }
}

module.exports=userCtrl
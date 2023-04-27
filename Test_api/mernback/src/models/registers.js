const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
   Name : {
      type:String,
      required:true
   },
   Email : {
      type:String,
      required:true,
      
   },
   password : {
      type:String,
      required:true
   },
   PhoneNumber : {
      type:Number,
      required:true,
      
   },
   RollNo : {
      type:String,
      required:true,
      
   },
   Hostel : {
      type:String,
      required:true
   },
   tokens:[{
      token:{
         type:String,
         required:true
      }
   }]
   
})



userSchema.methods.generateAuthToken = async function(){
   try {
      const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
      this.tokens = this.tokens.concat({token:token})
      await this.save();
      return token;
   } catch (error) {
      res.send("the error" + error);
      console.log("the error"+error);
   }
}

userSchema.pre("save", async function(next) {
   if(this.isModified("password")){
      this.password = await bcrypt.hash(this.password, 10);
   }
   
   next();
})

const Register = new mongoose.model("Register", userSchema);

module.exports = Register;
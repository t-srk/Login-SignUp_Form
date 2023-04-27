require('dotenv').config();

const express = require("express");
const flash = require('express-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require("path");
const app = express();
const hbs = require("hbs");
const methodOverride = require("method-override"); 

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

require("./db/conn");
const Register = require("./models/registers");
const { json } = require("express");
const { log } = require("console");

const port=process.env.PORT ||4000;

const static_path = path.join(__dirname, "../public" );
const templates_path = path.join(__dirname, "../template/views" );
const partials_path = path.join(__dirname, "../template/partials" );

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(session({
   secret: process.env.SECRET_KEY,
   resave: false, 
   saveUninitialized: false
}))
app.use(flash())
// app.use(bodyParser.urlencoded({extended:false}))
// app.use(bodyParser.json)

app.use(methodOverride("_method"))

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);

app.get("/",(req, res) =>{
   res.render("index")
});


app.get("/logout", auth, async(req, res) => {
   try {
      console.log(req.user);
      res.clearCookie("jwt");
      console.log("logged out successfully");

      await req.user.save();
      res.render("index");
   } catch (error) {
      res.status(500).send(error);
   }
})


app.get("/login", auth, (req,res)=>{
   res.render("index");
})

app.get("/register", (req,res)=>{
   res.render("register",{messages:req.flash()});
})

app.get("/login", auth, (req,res)=>{
   res.render("index");
})

app.get("/index", (req,res)=>{
   res.render("index");
})

// app.get("/logout", (req,res)=>{
//    //req.logout()
//    res.redirect("/index")
// })

app.post("/register", async (req,res)=>{
   try {
      
      const registerUser = new Register({
         Name : req.body.name,
         Email : req.body.email,
         password : req.body.password,
         PhoneNumber : req.body.phoneno,
         RollNo : req.body.rollno,
         Hostel : req.body.hostel
      })


      const email = req.body.email;
      const PhNum = req.body.phoneno;
      const password = req.body.password;
      // if(!email || !password){
      //    req.flash("error","Email and password are required")
      //    return res.redirect("register")
      // }

      const emailRegex = /^\S+@\S+\.\S+$/;
      // if (!emailRegex.test(email)) {
      //    // Invalid email address
      //    res.send(`Invalid email address`);
      // }

      const phoneRegex = /^[0-9]{10}$/;
      // if (!phoneRegex.test(PhNum)) {
      //    // Invalid phone number
      //    res.send(`Invalid phone number`);
      // }

      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,}$/;
      // if (!passwordRegex.test(password)) {
      //    // Invalid password
      //    res.send(`Invalid password`);
      // }



      const token = await registerUser.generateAuthToken();

      res.cookie("jwt", token, {
         // expires:new Date(Date.now() + 30000),
         httpOnly:true
      });


      const registered = await registerUser.save();
      if (emailRegex.test(email)) {
         if (phoneRegex.test(PhNum)) {
            if (passwordRegex.test(password)) {
               res.status(201).render("index");
            }
            else{
               res.send("Invalid passwor");
            }
         }
         else{
            res.send("Invalid phone number");
         }
      }
      else{
         res.send("Invalid email address");
      }
      

   } catch (error) {
      res.status(400).send(error);
   }
})

//login check


app.post("/login", async (req,res)=>{
   try {

      const email = req.body.email;
      const password = req.body.password;

      const useremail = await Register.findOne({Email:email});

      const isMatch = await bcrypt.compare(password, useremail.password);

      const userhostel = await useremail.Hostel;
      const hostelusers = await Register.find({Hostel:userhostel});

      // console.log(userhostel);
      // console.log(hostelusers);
      
      const token = await useremail.generateAuthToken();

      // userDetails.exec(function(error,data){
      //    if(error){
      //       console.log(error);
      //    }

      //    res.render('see', {record : data});


      // })

      res.cookie("jwt", token, {
         // expires:new Date(Date.now() + 30000),
         httpOnly:true
      });

      if(isMatch){
         res.status(201).render("see", {data: hostelusers});
      }else{
         res.send(`wrong password ${useremail.password}`);
      }
      
   } catch (error) {
      res.status(400).send("invalid detail")
   }
})

app.listen(port, ()=> {
   console.log('server is running at port no 4000');
});


{/* <script type = "text/javascript" >  
    function preventBack() { window.history.forward(); }  
    setTimeout("preventBack()", 0);  
    window.onunload = function () { null };  
</script> */}

// function setFormMessage(formElement, type, message) {
//    const messageElement = formElement.querySelector(".form__message");

//    messageElement.textContent = message;
//    messageElement.classList.remove("form__message--success", "form__message--error");
//    messageElement.classList.add(`form__message--${type}`);
// }

// function setInputError(inputElement, message) {
//    inputElement.classList.add("form__input--error");
//    inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
// }

// function clearInputError(inputElement) {
//    inputElement.classList.remove("form__input--error");
//    inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
// }

// document.addEventListener("DOMContentLoaded", () => {
//    // const loginForm = document.querySelector("#login");
//    // const signupForm = document.querySelector("#signup");

//    // document.querySelector("#linksignup").addEventListener("click", e => {
//    //     e.preventDefault();
//    //     loginForm.classList.add("form--hidden");
//    //     signupForm.classList.remove("form--hidden");
//    // });

//    // document.querySelector("#linklogin").addEventListener("click", e => {
//    //     e.preventDefault();
//    //     loginForm.classList.remove("form--hidden");
//    //     signupForm.classList.add("form--hidden");
//    // });

//    // loginForm.addEventListener("submit", e => {
//    //     e.preventDefault();

//    //     // Perform your AJAX/Fetch login

//    //     setFormMessage(loginForm, "error", "Invalid email or password");
//    // });

//    // document.querySelectorAll(".form__input").forEach(inputElement => {
//    //     inputElement.addEventListener("blur", e => {
//    //         if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 10) {
//    //             setInputError(inputElement, "Username must be at least 10 characters in length");
//    //         }
//    //     });

//    //     inputElement.addEventListener("input", e => {
//    //         clearInputError(inputElement);
//    //     });
//    // });
// });

const HttpError = require('../models/http-error')
// const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')//library to store secure or hash passwords
const jwt = require('jsonwebtoken')//this is a package which allows us to generate tokens with that private key
const User = require('../models/user');

// let DUMMY_USERS = [
//     {
//    id: "u1",
//    name: "Vini",
//    email: "test@test.com",
//    password:"1233qwe" }

// ] 

const getUser = async (req, res, next) =>{
    // res.json({users: DUMMY_USERS})
    let users;
    try{
     users = await User.find({},'-password ')//due to concept of protection we will add an empty js object and we can add email and name 
    //which will return email and name or -password(which means exclude password)
    }catch(err){
        const error = new HttpError('Fetching users failed, try again ', 500)
        return next(error)
    }
    res.json({users: users.map(user => user.toObject({getters: true})
    )})//find method returns an array so we cant get default js object as return 
}

const signUpUser = async (req, res, next) =>{
    const errors = validationResult(req);
if(!errors.isEmpty()){
  console.log(errors);
  return next(new HttpError('Invalid input kindly check your data', 422))
}
    const {name, email, password} = req.body;//places will be added automatically as they are linked up now to users
    let existingUser;
    try{
     existingUser = await User.findOne({email: email})
    }catch(err){
        const error = new HttpError('Signing up failed, Please try again later', 500)
         return next(error);
    }
    if(existingUser){
        const error = new HttpError('User exist already, Please login instead', 422) 
        return next(error) ;
    }
    let hashedpassword;
    try{
    hashedpassword = await bcrypt.hash(password,12)
    }catch(err){
    const error = new HttpError('Could not create user ,Please try again', 500);
    return next(error)
    }
     const createdUser = new User({
         name,
         email,
         image: req.file.path,
         password: hashedpassword,
         places: []
     });
     try{
       await createdUser.save()
     }catch(err){
         const error = new HttpError('Signing up failed, Please try again later',500);
         return next(error);
     }

     let token;
     try{
     token = jwt.sign({userId: createdUser.id, email: createdUser.email}, process.env.JWT_KEY, {expiresIn:'1hr'})
     }catch(err){
        const error = new HttpError('Signing up failed, Please try again later',500);
        return next(error);
     }
//     const hasUser = DUMMY_USERS.find(u => u.email === email)
// if(hasUser){
//     throw new HttpError("could not create user, email already exist", 422)  
// }
//    const createdUser = {
//        id: uuidv4(),
//        name: name,
//        email: email,
//        password: password
//    }    
//    DUMMY_USERS.push(createdUser);
//    res.status(201).json({user: createdUser.toObject({getters: true})})//this getter will remove the _id and to make it easier to access
   //the later id
   res.status(201).json({userId: createdUser.id, email: createdUser.email, token:token}) 
}
const logInUser = async (req, res, next) =>{
const {email, password} = req.body;
// const identifiedUser = DUMMY_USERS.find(u => u.email === email);
// if(!identifiedUser || identifiedUser.password !==password){
//     throw new HttpError("could not identify user, credentials seems to be wrong", 403)
// }
let existingUser;
    try{
     existingUser = await User.findOne({email: email})
    }catch(err){
        const error = new HttpError('Login failed, Please try again later', 500)
         return next(error);
    }
    // if(!existingUser || existingUser.password !== password){
        if(!existingUser){
        const error = new HttpError('Invalid credentials , could not login', 403)
         return next(error);
    }
    let isValidPassword = false;
    try{
    isValidPassword = await bcrypt.compare(password,existingUser.password);
    }catch(err){
        const error = new HttpError('Could not log you,Kindly check your credentials and try again later', 500);
        return next(error);
    }
    if(!isValidPassword){
        const error = new HttpError('Invalid credentials , could not login', 401)
         return next(error); 
    }
    let token;
    try{
    // token = jwt.sign({userId:existingUser.id, email: existingUser.email}, 'supersecret_dont_share', {expiresIn:'1hr'})
    token = jwt.sign({userId:existingUser.id, email: existingUser.email}, process.env.JWT_KEY, {expiresIn:'1hr'})
    }catch(err){
       const error = new HttpError('Logging up failed, Please try again later',500);
       return next(error);
    }

res.json({userId: existingUser.id, email: existingUser.email, token: token})
}
exports.getUser = getUser
exports.signUpUser = signUpUser
exports.logInUser = logInUser
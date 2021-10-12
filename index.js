const fs = require('fs')//The fs module enables interacting with the file system in a way (i.e deleting the file)
const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const usersRoutes = require('./routes/users-routes')
const placesRoutes = require('./routes/places-routes');
const HttpError = require('./models/http-error');
require('dotenv').config();
console.log(process.env);
const app = express();

app.use(bodyParser.json())//this will parse any incoming request body and extract json data there and will convert it into i.e object,array
app.use('/uploads/images', express.static(path.join('uploads', 'images')))//This is a built-in middleware function in Express. It serves or returns static files and is based on serve-static.
//what is CORS error - when the communicating from the frontend to the backend API from different servers(i.e from localhost:3000 to localhost:5000)
//CORS is a browser security concept to work around that the server has to attach certain headers to the response it sends back to the clent
//that basically allows the client to accessthe resources and then the browsers automatically detect these headers and then the browsers
//permits the access and not throw the CORS error


app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE')
    next();
})
app.use('/api/users', usersRoutes)
app.use('/api/places', placesRoutes); // => /api/places...
//to avoid code duplication in places-routes file for handling error we can use express js special feature which express has inbuilt 
//in it and that is a default error handler and we setb this up in appjs file as a middleware here we add a middleware after our routes 
//middleware and this does not need a path filter and we directly add a middleware function .Middleware functions usually have three parameter
// but in this there are four parameters which react treats as special function as a error handling middleware that means that this function
//will only be executed on the request that has an error attached to it i.e request that has an error thrown in the end .And then we acn use 
//an default error handling code first we should check that response headerSent is true which checks whether the response is sent is true 
//or not
app.use((req, res, next)=>{
 const error = new HttpError('could not find this route', 404)
 throw error;   
})
app.use((error, req, res, next) =>{
    if(res.file){//incase something goes wrong with the request which has a file attach to it then we can roll back our file upload
      fs.unlink(req.file.path, err => {//unlink is for deleting the file so file is the object and path is the property of that object
      console.log(err);
      })  
    }
    if(res.headerSent){
        return next(error) //in this case we wont send response on our own becoz we already did sent the response & u can send one response
    }
    const status = error.status || 500;
    res.status(status); //else in this case developer want to send response now for this we need to set the status code on the error object
    //and if no code is setup on error object than 500 is a default status code which states that something went wrong on server
    res.json({message: error.message || 'An unknown error occured'})
})
// mongoose.connect('mongodb+srv://Binita:11012008@cluster0.kihty.mongodb.net/mern?retryWrites=true&w=majority')
//code after saving credentials(i.e user, password and db name)as environment variables in nodemon.json file
// const db_username = process.env.DB_USER;
// const db_password = process.env.DB_PASSWORD;
// const db_name = process.env.DB_NAME;
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kihty.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
.then(() => {
    app.listen(process.env.port || 5000);//if we have a successfull logic
})
.catch((error) =>{
    console.log(error);
})
// app.listen(5000);

//steps to connect backend to the database
//1. connect main (i.e index.js ) with mongoose .connect
//2. create schema and model (i.e places.js file)
//3. create crud operations i.e create, read, update, delete (i.e places-controllers)
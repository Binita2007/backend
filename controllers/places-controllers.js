const fs = require('fs');
 const HttpError = require('../models/http-error');
 const getCordsForAddress = require('../util/location')
const {validationResult} = require('express-validator');
const mongoose = require("mongoose");
 const uuid = require('uuidv4');
const { v4: uuidv4 } = require('uuid');
const Place = require('../models/place');
const User = require('../models/user');//inorder to interact with userSchema and create connections with userSchema we need to require it
// const mongooseUniqueValidator = require('mongoose-unique-validator');
 // so  when the routes file get bigger and bigger we can bring all logic to this controlllers file therefore we want to have the focused file
 // i.e file which has all about routing and mapping paths and Http methods to places-routes and then we have controllers which is all 
 //about having this middleware functions and logic so its okay if the controller file gets bigger

//  let DUMMY_PLACES = [
//     {
//       id: 'p1',
//       title: 'Empire State Building',
//       description: 'One of the most famous sky scrapers in the world!',
//       location: {
//         lat: 40.7484474,
//         lng: -73.9871516
//       },
//       address: '20 W 34th St, New York, NY 10001',
//       creator: 'u1'
//     }
  // ];
// const getPlaceById = async ('/:pid', (req, res, next) => {
  const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid; // { pid: 'p1' }
  
    // const place = DUMMY_PLACES.find(p => {
    //   return p.id === placeId;
    // });
    //findById is a method provided by mongoose 
    let place;
    try{
     place = await Place.findById(placeId)
} catch(err){    //this error is displayed if our request have some general problem i.e missing some info
  const error = new HttpError('Something went wrong , could not find place', 500)
return next(error) //to stop further execution of code
}
    if(!place){ //this error is displayed incase our request is fine but the place id is not there in our database
      const error = new HttpError('Could not find places for the requested id', 404)
      return next(error)
}

// res.json({ place }); - here the place object is a special monmgoose object so we will convert this to normal js object and then get rid of _ of _id
res.json({ place: place.toObject({getters: true}) });//here we are converting _id from place object to normal js object and getting rid of _ from it
};
const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
  
    // const place = DUMMY_PLACES.filter(p => { //to filter all the places of same user id
    // let places; //in order to use populate() method we change our code here
    let userWithPlaces ;
    try{
    userWithPlaces = await User.findById(userId).populate('places')
      // userWithPlaces = await Place.find({creator: userId})
    }catch(err){
      const error = new HttpError('Fetching failed , Please try later', 500)
      return next(error) //to stop further execution of code
      } 
    
    
  // if (!places || places.length === 0){
//     if(!userWithPlaces || userWithPlaces.places.length === 0){
//     return next(new HttpError('Could not find places for the requested user id', 404))
// }
res.json({ places: userWithPlaces.places.map( place => place.toObject({getters: true})) })}
  //


// const createPlace = (req, res, next) =>{
// const errors = validationResult(req);
// if(!errors.isEmpty()){
//   console.log(errors);
//   throw new Error('Invalid input kindly check your data', 422)
// }
// const {title, description, coordinates, address, creator} = req.body; //i.e const title = req.body.title
// //we are just extracting data from the incoming request
// const createdPlace = {
//   id: uuidv4(),
//   title, //shortcut for title: title
//   description,
//   location: coordinates,
//   address,
//   creator
// }
// DUMMY_PLACES.push(createdPlace)
// res.status(201).json({place: createdPlace})
// }
// in order to use coordinates for location from other backend api we need to convert createPlace function to a async function and use
//next for error in place of throw new error as it does not work in async function which returns promise

const createPlace = async (req, res, next) =>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors);
    return next (new HttpError('Invalid input kindly check your data', 422))
  }
  const {title, description, address} = req.body; //i.e const title = req.body.title
  //we are just extracting data from the incoming request
  let coordinates; //we convert the address to coordinates
  try{
   coordinates = await getCordsForAddress(address)//we call getCordsForAddress and pass in the address which returns a promise so we use await here
  }catch (error){
    return next(error)//when working with async await throw error will not work properly that is why we are using next function here
  }
  // const createdPlace = {
  //   id: uuidv4(),
  //   title, //shortcut for title: title
  //   description,
  //   location: coordinates,
  //   address,
  //   creator
  // }
  // DUMMY_PLACES.push(createdPlace)
  // 

//in order to incorporate Place model (i.e in place.js) with createPlace we replace the code of createdPlace
  const createdPlace = new Place({
    title, //shortcut for title: title
    description,
    address,
    location: coordinates,
    image: req.file.path,//here we are just storing the path not the actual file which multer gives us automatically as storing the file to the backend is a bad idea as it slows down backend instaead sore file on the file system locally (i.e uploads/images)
    creator: req.userData.userId //now we store real mongodb user object id in this fielding after connecting this to userSchema
  })
 let user;//in order whether we have user of that objectId existing or not becoz new place can only be created if the user of that id is existing
 try{
 user = await User.findById(req.userData.userId)
 }catch(err){ // this is for general error 
 const error = new HttpError('Creating place failed, try again later', 500)//this is for general error
 return next(error)
 }
 if(!user){
  const error = new HttpError('Could not find user for provided id ', 404)// this error is for not finding user
  return next(error) //to stop the code execution
 }
 console.log(user);
  //incase the user for the id existed then 2 things we had to do first to create and store that new document of place and second
  //we can add that place id to the corresponding user to do that we need session and transactions. Transactions allow u to perform 
  //multiple operations in isolation of each other and basically transactions are built on sessions.So we first need to start a session
  //and then wer can initiate transaction and once the transaction is successfull session is finished and transaction is committed with 
  //that our place is created and stored in our users document
  try{
  // await createdPlace.save();//dot save is a method available in mongoose and save will handle all the mongodb code u need to store a new document/collection
  //in ur database and it will also create the unique places id .Dot save is a promise this means an asynchronous task as saving files on
  //our databse can take few moments therefore we add await and inorder to catch any potential errors we add try {} and catch
  //
  const sess = await mongoose.startSession();//this is our current session it is an async task we start with mongoose startSession method
  sess.startTransaction();//after session we initiated transaction on our session with startTransaction method
  await createdPlace.save({session: sess});//we stored the place
  user.places.push(createdPlace);//with the place being created we now need to add this place to the particular user(push here is not 
  //normal js push but it is a special method provided by mongoosewhich allows mongoose behind the scene to establish the connection 
  //between two models)
  await user.save({session: sess}) //we have to save our updated user and this updated user shold be the part of our session that we are referring to
  await sess.commitTransaction()//at last the seesion commitsTransaction which is an async task and only at this time changes are saved in 
  //the database if any step goes wrong all changes would roll back automatically in the mongodb
}catch(err){
   const error = new HttpError('Creating place failed, Please try again.', 500);//error code 500
  return next(error);//next(error) to stop further execution of code other wise the code keeps on executing further code as it is async function
}
res.status(201).json({place: createdPlace});
  };



const updatePlace = async (req, res, next) =>{
  const errors = validationResult(req);
if(!errors.isEmpty()){
  console.log(errors);
  return next (new Error('Invalid input kindly check your data', 422))
}
  const {title, description} = req.body
  const placeId = req.params.pid;
// const updatedPlace = {...DUMMY_PLACES.find(p => p.id === pid)} //now we dont need this dummy data
// const placeIndex = DUMMY_PLACES.findIndex(p => p.id === pid)
let place;
try{
place = await Place.findById(placeId)
}catch(err){
  const error = new HttpError("Something went wrong, could not update place", 500)
  return next(error)
}
if(place.creator.toString() !== req.userData.userId){
  const error = new HttpError("You are not authorized to change the place", 401)//401 is an authorization error status code
  return next(error)
}
// updatedPlace.title = title;
// updatedPlace.description = description;
// DUMMY_PLACES[placeIndex] = updatedPlace;
place.title = title;
place.description = description;
try{
  await place.save() //after update we need to save the update like we did in create place and save is an async function
}catch(err){
  const error = new HttpError("Something went wrong, could not update place", 500)
return next(error)}
res.status(200).json({place: place.toObject({getters: true}) }) //used this toObject to get rid of _id in the place object
}

const deletePlaceById = async (req, res, next) =>{
  const placeId = req.params.pid;
  // if(DUMMY_PLACES.filter(p => p.id === !pid)){
  //   throw new HttpError("could not find the place of that id", 404)
  // }
  let place;
  try{
  place = await Place.findById(placeId).populate('creator') //({path: 'creator', model: User});
  //populate allows to refer document stored in another collection and to work with
  //data in existing document(i.e place to be deleted from places collection should also be deleted from user document in the user Collection
  //under which user id it is store  ) so that the user document also get updated with the information .To do so we need the relation between 
  //these two collection and these relation are establish in our user js file(i.e ref: "Place") and our placejs file(i.e ref: "User"). If
  //this relation is there we are allowed to use method populate otherwise this method will not work and this method needs one additional 
  //information (i.e information about the document where we want to change something and within this document we need to refer the specific 
  //property and in our case this is the creator property becoz it contains the userid mongoose then searches that userid and make changes)
  }catch(err){ //this is the general error block
  const error = new HttpError('could not delete place',500)
  return next(error)
  }
  if(!place){
    const error = new HttpError('We could not find place for this id ',404)//error if dont find place id for deleting
  return next(error)
  }
  if(place.creator.id !== req.userData.userId){
    const error = new HttpError('You are not allowed to edit this place ',401) //means unathorized
    return next(error)
  }
  const imagePath = place.image;
  try{
  // await place.remove()
  //So these sessions and corresponding transactions always deal with the ObjectId?
//Pushing the createdPlace to the user places array and pulling the place from the creator (added by populate) within the place automatically
// and only uses the ObjectId key-value
  const sess = await mongoose.startSession()
  sess.startTransaction();//after session we initiated transaction on our session with startTransaction method
  await place.remove({session: sess});
  place.creator.places.pull(place)//we need access place stored in the creator (i.e placeid) for that we refer to place.creator nad in
  //that creator we need places .By pull method mongoose will automatically remove the id.thanx to the populate method which gives us 
  //full user object linked to the place
  await place.creator.save({session: sess})
  await sess.commitTransaction()
  }catch(err){
    const error = new HttpError('could not delete place',500)
    return next(error)
  }
  // if(place.length === 0){
  //     throw new HttpError("could not find the place of that id", 404)
  //   // }
  fs.unlink(imagePath, err => {
    console.log(err);
  })
  res.status(200).json({message: 'place deleted'})
}
//so now in this file we need to export multiple objects/functions therefore we use this following method of export offered by express

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;  
exports.createPlace = createPlace;
exports.updatePlace= updatePlace;
exports.deletePlaceById = deletePlaceById;
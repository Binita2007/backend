const express = require('express');

//const validator = require('express-validator')
const { check } = require('express-validator')//check method is a function that we can  execute and it will return a new middleware
//which is configured for validation requirement
// const HttpError = require('../models/http-error');
const router = express.Router();
const placesControllers = require('../controllers/places-controllers')
const checkAuth = require('../middleware/check-auth')
const fileUpload = require('../middleware/file-upload')//it is a bunch of middleware out of which we r calling single middleware
//All logic and middleware code now transffered to places-controllers file so that this routes file does not get bigger therefore 
//it is a good idea to follow a MVC structure which stands for Model View Controller

// const DUMMY_PLACES = [
//   {
//     id: 'p1',
//     title: 'Empire State Building',
//     description: 'One of the most famous sky scrapers in the world!',
//     location: {
//       lat: 40.7484474,
//       lng: -73.9871516
//     },
//     address: '20 W 34th St, New York, NY 10001',
//     creator: 'u1'
//   }
// ];
router.get('/:pid', placesControllers.getPlaceById);//we are fine sending request to these two routes without any authentication required
router.get('/user/:uid', placesControllers.getPlacesByUserId);
router.use(checkAuth);// requests travel through middlewares from top to bottom.As we have a middleware here which checks whether the 
//request sent by the user is authenticated or not if the user is not authenticated than we can throw an error at this point. So the 
//request without a valid token cannot reach the bottom routes becoz it will always be handled by this middleware
router.post('/',
fileUpload.single('image'),[
   check('title').not().isEmpty(),
  check('description').isLength({min: 5}),
  check('address').not().isEmpty()
], //validation -> that the title is not empty by using check function and chaining it with different methods
 placesControllers.createPlace);
router.patch('/:pid',[
  check('title').not().isEmpty(),
check('description').isLength({min: 5})
], placesControllers.updatePlace);
router.delete('/:pid', placesControllers.deletePlaceById);
// router.get('/*', (req, res, next) => {
//   console.log('Get request in places');

//   res.json({message:'It works!'})
//   res.setHeader('content-type', 'application/json');
// })
// router.get('/:pid', (req, res, next) => {
//   const placeId = req.params.pid; // { pid: 'p1' }

//   const place = DUMMY_PLACES.find(p => {
//     return p.id === placeId;
//   });
//   if(!place){
  // return res.status(404).json({message: "Could not find place"})

    //const error = new Error('Could not find place for the requested id')
   // error.code = 404;
  //return next(error); //in case of asynchronous code we can call next and pass an error to  it
//   return next(new HttpError('Could not find place for the requested id', 404))
//   }

//   res.json({ place }); // => { place } => { place: place }
// });

// router.get('/user/:uid', (req, res, next) => {
//   const userId = req.params.uid;

//   const place = DUMMY_PLACES.find(p => {
//     return p.creator === userId;
//   });
// if(!place){
  //const error = new Error('Could not find place for the requested user id')
  //error.code = 404;
  //throw error//incase of synchronous code we can throw new Error and u dont have to use return here becoz throw automatically cancels the further
  //execution of code
//   throw new HttpError('Could not find place for the requested user id', 404)
// }
//   res.json({ place });
// });

module.exports = router;

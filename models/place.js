//file for place schema

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const placeSchema = new Schema({ //imported mongoose packages that holds schema method whichn is constructor function
    //by adding new we can a pass a new  javascipt object in this function
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},//when we work with database image is always is a Url pointing towards a file which 
    //is not stored in our database as storing image in a database is not a good idea as it slows down the speed of database as image is a big file 
    location: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true}
    },
    address: {type:String, required: true},
    // creator: {type: String, required: true}//now we need to change this dummy creator to real creator id(a mongodb objectId)and to
    //tell mogodb that this is a real mongodb id(i.e type:mongoose.Types.ObjectId)
    creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'}// ref is there to set the link between placeShema and userSchema
});
// we need to add a model based on the schema and then to use that model in our app file
// placeSchema.set('toJSON', { getters: true });// we set this in order to get rid of _id object
module.exports = mongoose.model('Place', placeSchema)//convention is that mongoose model return a contructor function which has two parameters
//the first arguement is the name of the model always written in uppercase starting character and in singular form and later this name will 
//also be going to be the name of our collection but in lowercase and in plural form, the second argument is the schema we want to refer to our model
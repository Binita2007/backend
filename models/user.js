const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new Schema({
    name : {type: String, required: true},
    email: {type: String, required: true, unique: true},//unique creates an internal index in the database to make it easier and faster
    password: {type: String, required: true, minlength:6},//our email queries
    image: {type: String, required: true},
    // places: {type: String, required: true}//now we need to change this dummy places to real places id(a mongodb objectId)and to
    //tell mogodb that this is a real mongodb id(i.e type:mongoose.Types.ObjectId)
    places: [{type: mongoose.Types.ObjectId, required: true, ref: "Place"}]// ref is there to set the link between placeShema and 
    //userSchema and an array is added to tell mongodb that this is an array of places not a single place that an user can have
});
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);

//With Mongoose, you can prevent duplicates in your databases using validation. Validation is defined in the SchemaType and is a middleware.
// You can also create your own validation in the schema or you can use Mongooses’s built in validation. To prevent duplicates, we r
//ecommend using the unique property as it tells Mongoose each document should have a unique value for a given path. It is a shorthand 
//for creating a MongoDB unique index on, in this case, email.
//mongoose-unique-validator is a plugin which adds pre-save validation for unique fields within a Mongoose schema.
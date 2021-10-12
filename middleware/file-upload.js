//File upload is a common feature that almost every website needs. To perform uploading operation in ExpressJS 
//we have middleware known as Multer.Multer is a node.js middleware for handling multipart/form-data, which is 
//primarily used for uploading files. It is written on top of busboy for maximum efficiency.
//NOTE: Multer will not process any form which is not multipart (multipart/form-data).
//Multer adds a body object and a file or files object to the request object. The body object contains the values
// of the text fields of the form, the file or files object contains the files uploaded via the form.
//before we were just sending and accept data in json format but now will switch to this different type of data 
//(i.e multipart/form-data) for some request and the special thing about this type of data is that it contains the 
//mixture of normal text data and file dataor binary data becoz json can only work with text data and binary data 
//is different and json cant deal with binary data . Multiform data can deal with binary data for this we need to install multer
const multer = require('multer');
const uuid = require('uuidv4');//this package is for unique id
const { v4: uuidv4 } = require('uuid');
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}
const fileUpload = multer({
    limits: 500000,
    storage: multer.diskStorage({
        destination:(req, file, cb)=> { //cb(callback function)
        cb(null, 'uploads/images')
        },
        filename: (req, file, cb)=> {
            const ext = MIME_TYPE_MAP[file.mimetype]
            cb(null, uuidv4() + '.' + ext);
        }
    }),
    fileFilter: (req, file, cb) => { //cb is for callback
    const isValid = !!MIME_TYPE_MAP[file.mimetype] //so now with double bang operator we are converting null or undefined to false
    let error = isValid ? null : new Error('Invalid mimetype')   
    cb(error, isValid)
    },
});

module.exports = fileUpload; //we will export this middleware
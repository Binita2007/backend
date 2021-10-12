const express = require('express');
const {check} = require('express-validator')

// const HttpError = require('../models/http-error');

const router = express.Router();
const usersControllers = require('../controllers/users-controllers')
const fileUpload = require("../middleware/file-upload")

router.get("/", usersControllers.getUser);
router.post("/signUp",
fileUpload.single('image'),//here we r using multermiddleware(i.e fileUpload)vb to upload the image with the signup of user
[check("name").not().isEmpty(),
check("email").normalizeEmail().isEmail(), //Test@test.com => test@test.com
check("password").isLength({min:6})],
 usersControllers.signUpUser);
router.post("/logIn", usersControllers.logInUser);

module.exports = router;
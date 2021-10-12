// a class in Java is simply a template for creating objects with similar attributes and behavior.

class HttpError extends Error {
    constructor(message, errorCode){
        super(message) //Add a "message" property
        this.code = errorCode // Add a "code" property
    }
}

module.exports = HttpError;


//In Node. js, Modules are the blocks of encapsulated code that communicates with an external 
//application on the basis of their related functionality. 
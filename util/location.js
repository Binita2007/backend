const axios = require('axios');
const HttpError = require('../models/http-error');

// const API_KEY = "pk.c467e67f1639a1687a4d29bdd83f25bf";
const API_KEY = process.env.LOCATION_API_KEY;

//axios is a package that can be used on node server to send a Http request from frontend to backend(i.e another backend)
async function getCordsForAddress (address){
    // return {
    //     lat: 40.7484474,
    //     lng: -73.9871516
    //   }
    //encodeURIComponent - simply pass address string to it & it will give u back a string which encodes everything into the url
    //friendly format
    const response = await axios.get(`https://us1.locationiq.com/v1/search.php?key=${API_KEY}&q=${encodeURIComponent(
        address)}&format=json`)//address of free map api

    // const data = response.data
    const data = response.data[0]

    if(!data || data.status === 'ZERO RESULTS'){
        const error = new HttpError('Could not find location for the specified address', 422)
    throw error;
}
// const coordinates = data.result[0].geometery.location
const coorLat = data.lat;
const coorLon = data.lon;
const coordinates = {
  lat: coorLat,
  lng: coorLon
};
return coordinates;
}
module.exports = getCordsForAddress;

//https://us1.locationiq.com/v1/search.php?key=<Your_API_Access_Token>&q=&format=json
//pk.c467e67f1639a1687a4d29bdd83f25bf
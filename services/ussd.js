const express = require("express");

const router = express.Router();


// Get authentication
// const credentials = {
//     apiKey: process.env.APIKEY, // use your sandbox app API key for development in the test environment
//     username: process.env.USER_NAME // use 'sandbox' for development in the test environment
//   };
//   console.log(credentials);
//   const AfricasTalking = require("africastalking")(credentials);

router.post("/", (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text} = req.body;

    console.log(req.body);

    let response = "END yes";

    if (text == '') {
        // This is the first request. Note how we start the response with CON
        response = `END What would you like to check
        1. Create Account
        2. Check Balance`;
    } 
    else if ( text == '1') {
        // Business logic for first level response
        response = `Choose account information you want to view
        1. Account number`;
    } else if ( text == '2') {
        // Business logic for first level response
        // This is a terminal request. Note how we start the response with END
        response = `END Your phone number is ${phoneNumber}`;
    } else if ( text == '1*1') {
        // This is a second level response where the user selected 1 in the first instance
        const accountNumber = 'ACC100101';
        // This is a terminal request. Note how we start the response with END
        response = `END Your account number is ${accountNumber}`;
    }

    // Send the response back to the API
    // res.set('Content-Type: text/plain');
    res.send(response);
});

module.exports = router;
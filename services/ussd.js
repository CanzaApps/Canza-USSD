const express = require("express");
const router = express.Router();
const { MongoClient } = require('mongodb');
const dotenv = require("dotenv").config();
const ContractKit = require("@celo/contractkit");
const cors = require("cors");
const ussdRouter = require("ussd-router");
const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const serviceAccount = require("../config/serviceAccount.json");
const { createWallet, getBalance } = require("../utils/generate-celo-address");
const { userAddressFromDB, addUserInfo } = require("../model/schema")
// const { credential } = require("firebase-admin");

const alfatores = process.env.ALFAJORES;

const kit = ContractKit.newKit(alfatores);
console.log(kit);

// Mongo DB
const uri = process.env.URI;
const { UserInfo } = require("../model/schema");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "",
// });
// const firestore = admin.firestore();
// const crypto = require("crypto");
// const bip39 = require("bip39-light");

// const ussdcalls = express().use(
//   cors({ origin: true }),
//   express.json(),
//   express.urlencoded({ extended: true })
// );

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
// const validateFirebaseIdToken = async (req, res, next) => {
//   console.log("Check if request is authorized with Firebase ID token");

//   if (
//     (!req.headers.authorization ||
//       !req.headers.authorization.startsWith("Bearer ")) &&
//     !(req.cookies && req.cookies.__session)
//   ) {
//     console.error(
//       "No Firebase ID token was passed as a Bearer token in the Authorization header.",
//       "Make sure you authorize your request by providing the following HTTP header:",
//       "Authorization: Bearer <Firebase ID Token>",
//       'or by passing a "__session" cookie.'
//     );
//     res.status(403).send("Unauthorized");
//     return;
//   }

//   let idToken;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer ")
//   ) {
//     console.log('Found "Authorization" header');
//     // Read the ID Token from the Authorization header.
//     idToken = req.headers.authorization.split("Bearer ")[1];
//   } else if (req.cookies) {
//     console.log('Found "__session" cookie');
//     // Read the ID Token from cookie.
//     idToken = req.cookies.__session;
//   } else {
//     // No cookie
//     res.status(403).send("Unauthorized");
//     return;
//   }

//   try {
//     const decodedIdToken = await admin.auth().verifyIdToken(idToken);
//     console.log("ID Token correctly decoded", decodedIdToken);
//     req.user = decodedIdToken;
//     next();
//     return;
//   } catch (error) {
//     console.error("Error while verifying Firebase ID token:", error);
//     res.status(403).send("Unauthorized");
//     return;
//   }
// };

// Initialize the firebase auth
// const firebaseAuth = createFirebaseAuth({ ignoredUrls: ['/ignore'], serviceAccount, admin });
// const getAuthToken = (req, res, next) => {
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.split(" ")[0] === "Bearer"
//   ) {
//     req.authToken = req.headers.authorization.split(" ")[1];
//     console.log("Auth Token", req.headers.authorization);
//   } else {
//     // req.authToken = null;
//     return res.status(201).json({
//       message: "Not Allowed",
//     });
//   }
//   next();
// };

router.post("/", async (req, res) => {
  console.log(req.body, "req is");
  //   res.set("Content-Type: text/plain");
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  // const {body: {text: rawText, phoneNumber, sessionId }} = req;

  let response = "CON ";

  if (text == "") {
    // This is the first request. Note how we start the response with CON
  
    response += `Welcome to Canza Ecosystem!
        What would you like to do?
        1. Create Account
        2. Check Balance
        3. See Wallet Address`;
  } else if (text == "1") {
    // create Account'
    // async function wallet() {
      const user = await userAddressFromDB(phoneNumber);
      if(user.length <= 0 ){
      const data = await createWallet();

      console.log(data, "Wallet Created");
      response = `END Wallet Address has been created
      `;
      addUserInfo({ 
        address: data.address,
        phoneNumber,
        privateKey: data.privateKey
        });
      }else{
        response ="END Canza Address Already Exist"
      }

    // }
    // wallet();
  } else if (text == "2") {
    // get Balance
    const phoneBalance = await userAddressFromDB(phoneNumber);
    const balance = await getBalance(phoneBalance[0].address)
    response = `END Your Canza Address Balance \n ${balance}`;
  } else if (text === "3") {
    // const checkAddress = ``

    const user = await userAddressFromDB(phoneNumber);

    response = `END This is Your Canza Address \n ${user[0].phoneNumber}`;
  }

  // Send the response back to the API
  // res.set('Content-Type: text/plain');
  res.send(response);
});

module.exports = router;

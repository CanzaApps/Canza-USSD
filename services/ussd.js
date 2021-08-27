require("dotenv").config();
const express = require("express");
const router = express.Router();
const { MongoClient } = require('mongodb');
const ContractKit = require("@celo/contractkit");
const { createWallet, getBalance, totalBalances } = require("../utils/generate-celo-address");
const { userAddressFromDB, addUserInfo } = require("../model/schema")
// const { credential } = require("firebase-admin");

const alfatores = process.env.ALFAJORES;

const kit = ContractKit.newKit(alfatores);
console.log(kit);

// Mongo DB
const uri = process.env.URI;
const { UserInfo } = require("../model/schema");

router.post("/", async (req, res) => {
  console.log(req.body, "req is");
  const { sessionId, serviceCode, phoneNumber, text, } = req.body;

  let response = "CON ";

  if (text == "") {
    // This is the first request. Note how we start the response with CON
  
    response += `Welcome to Canza Ecosystem!
        What would you like to do?
        1. Create Account
        2. Check Balance
        3. See Wallet Address
        4. Input Number
        `;
  } else if (text == "1") {
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
  } else if (text == "4") {
    response = `CON Input the Number \n`;
  } else if ((/4*/).test(text)) {
    const number = text.split("*")[1];
    const user = await userAddressFromDB(number);
      if(user.length <= 0 ){
      const data = await createWallet();

      console.log(data, "Wallet Created");
      response = `END Wallet Address has been created
      `;
      addUserInfo({ 
        address: data.address,
        number,
        privateKey: data.privateKey
        });
      }else{
        response ="END Canza Address Already Exist"
      } 
  }
  res.send(response);
});

module.exports = router;
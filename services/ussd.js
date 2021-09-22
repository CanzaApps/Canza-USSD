require("dotenv").config();
const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const ContractKit = require("@celo/contractkit");
const { createWallet, getBalance, totalBalances } = require("../utils/generate-celo-address");
const { UserInfo, userAddressFromDB, addUserInfo } = require("../model/schema");
const crypto = require("crypto");
const tinyURL = require("tinyurl");
// const { credential } = require("firebase-admin");

const alfatores = process.env.ALFAJORES;

const kit = ContractKit.newKit(alfatores);
// console.log("celo connection", kit);

// Mongo DB
const uri = process.env.URI;

router.post("/", async (req, res) => {
  // console.log("my req body is", req.body);
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = "CON ";
  var data = text.split('*');

  if (text == "") {
    // This is the first request. Note how we start the response with CON

    response += `Welcome to Canza Ecosystem!
        What would you like to do?
        1. Create Account
        2. Check Balance
        3. See Wallet Address
        4. Send Money
        5. Input Number
        `;
  } else if (text == "1") {
    const user = await userAddressFromDB(phoneNumber);
    // console.log("user infomation:", user[0].address)
    if (user.length <= 0) {
      const data = await createWallet();
      
      console.log("Wallet Created", data);

      response = `END Wallet Address has been created`;
      addUserInfo({ address: data.address, phoneNumber, privateKey: data.privateKey });

    } else {
       response = "END Canza Address Already Exist";
    }

    // wallet();
  } else if (text == "2") {
    // get Balance
    // const phoneBalance = await userAddressFromDB(phoneNumber);
    // const balance = await getBalance(phoneBalance[0].address);
    response = await getAccountBalance(phoneNumber)
    // response = `END Your Canza Address Balance \n ${mybalance}`;
  } else if (text === "3") {
    // checkAddress if account exits 
    // const user = await userAddressFromDB(phoneNumber);
    // let userMSISDN = phoneNumber.substring(1);
    
    response = await getAccountDetails(phoneNumber);

  // send money and transfer funds 
  } else if (data[0] == '4' && data[1] == null) {
    response = `CON Enter Recipient`;
  } else if (data[0] == '4' && data[1] !== '' && data[2] == null){
    response = `CON Enter Amount to send`;
  } else if (data[0] == '4' && data[1] !== '' && data[2] !== '' ){
    senderMSISDN = phoneNumber
    console.log('Sender:', senderMSISDN.substring(1))
    receiverMSISDN = '+254' + data[1].substring(1)
    console.log('Recipient: ', receiverMSISDN)
    amount = data[2];
    console.log('Amount: ', amount)
    response = `END NGN` +amount+ ` sent to ` +receiverMSISDN+ ` Celo Account`;

    // senderId = await getSenderId(senderMSISDN)
    // console.log('senderId:', senderId)
    // recipientId =await getRecipient(receiverMSISDN)
    // console.log('recipientId:', recipientId)
    transfercUSD(senderMSISDN, receiverMSISDN, amount)


    Promise.all()
    .then(result => console.log(result))
    .then(() => transfercUSD(senderMSISDN, receiverMSISDN, amount))
    .then(hash => getTxidUrl(hash))
    .then(url => {
      console.log('PhoneNumber:', senderMSISDN)
    }).catch(err => console.log(err))

  } else if (text == "5") {
    response = `CON Input the Number \n`;
  } else if (/5*/.test(text)) {
    const number = text.split("*")[1];
    const user = await userAddressFromDB(number);
    if (user.length <= 0) {
      const data = await createWallet();

      console.log(data, "Wallet Created");
      response = `END Wallet Address has been created
      `;
      addUserInfo({
        address: data.address,
        number,
        privateKey: data.privateKey,
      });
    } else {
      response = "END Canza Address Already Exist";
    }
  }
  res.send(response);
});

async function getAccountDetails(userMSISDN) {
  console.log("phone number",userMSISDN);
  
  const user = await userAddressFromDB(userMSISDN);
  let accountAddress = user[0].address

  console.log('account yangu', accountAddress)
  let url = await getUserAddressUrl(accountAddress);
  
  console.log("Address Url Link:", url);
  return `END Your Account Number is: ${userMSISDN}
  ...Account Address is: ${url}`;
}

//  account balance
async function getAccountBalance(userMSISDN) {
  console.log("phone balance..", userMSISDN);

  const user = await userAddressFromDB(userMSISDN);
  let accountaddress = user[0].address
  console.log('my address:', accountaddress)

  const stableTokenWrapper = await kit.contracts.getStableToken()
  let cUSDBalance = await stableTokenWrapper.balanceOf(accountaddress) // In cUSD
  cUSDBalance = kit.web3.utils.fromWei(cUSDBalance.toString(), 'ether')
  console.info(`Account balance of ${cUSDBalance.toString()}`)

  const goldTokenWrapper = await kit.contracts.getGoldToken()
  let cGoldBalance = await goldTokenWrapper.balanceOf(accountaddress) // In cGLD
  cGoldBalance = kit.web3.utils.fromWei(cGoldBalance.toString(), 'ether')   
  console.info(`Account balance of ${cGoldBalance.toString()}`)

  return `END Your Account Balance is:
          Celo Dollar: ${cUSDBalance} cUSD
          Celo Gold: ${cGoldBalance} cGLD`
}

// details
async function getReceiverDetails(recipientId) {

  let user = await userAddressFromDB(recipientId)
  console.log('user info is:', user)

}

// shortUrl
async function getTxidUrl(txid){
  return await getSentTxidUrl(txid);
}

function getSentTxidUrl(txid){
  return new Promise(resolve => {
    const sourceURL = `https://alfajores-blockscout.celo-testnet.org/tx/${txid}/token_transfers`;
    resolve (tinyURL.shorten(sourceURL))  
  })
}

async function getAddress(userAddress) {
  return await getUserAddressUrl(userAddress);
}

function getUserAddressUrl(userAddress) {
  return new Promise((resolve) => {
    const sourceURL = `https://alfajores-blockscout.celo-testnet.org/address/${userAddress}/`;
    resolve(tinyURL.shorten(sourceURL));
  });
}

// get sender
function getSenderId(phoneNumber){
  return new Promise( resolve => {
    let senderId = crypto.createHash('sha1').update(phoneNumber.substring(1)).digest('hex');
    resolve(senderId);
  })
}

// get recipient
function getRecipient(phoneNumber) {
  return new Promise((resolve) => {
    let recipient = crypto.createHash("sha1").update(phoneNumber).digest("hex");
    resolve(recipient);
  });
}

async function transfercUSD(senderId, recipientId, amount) {
  try {
    const user = await userAddressFromDB(senderId)
    let senderInfo = user[0].address;
    let senderKey = user[0].privateKey
    console.log("sender Address:", senderInfo)

    const userDoc = await userAddressFromDB(recipientId)
    let receiverInfo =  userDoc[0].address
    console.log('Receiver Adress: ', receiverInfo)

    let cUSDAmount = amount*0.01;
    console.log('cUSD Amount: ', cUSDAmount);

    return sendcUSD(`${senderInfo}`, `${receiverInfo}`, cUSDAmount, senderKey)

  } catch (err) {
    console.log(err);
  }
}

async function convertfromWei(value) {
  return kit.web3.utils.fromWei(value.toString(), "ether");
}

async function sendcUSD(sender, receiver, amount, privatekey) {
  const weiTransferAmount = kit.web3.utils.toWei(amount.toString(), "ether");
  const stableTokenWrapper = await kit.contracts.getStableToken();

  const senderBalance = await stableTokenWrapper.balanceOf(sender); //cUSD
  if (amount > senderBalance) {
    console.error(
      `Not enough funds in sender balance to fulfill request: ${await convertfromWei(
        amount
      )} > ${await convertfromWei(senderBalance)}`
    );
    return false;
  }

  console.info(
    `sender balance of ${await convertfromWei(
      senderBalance
    )} cUSD is sufficient to fulfill ${await convertfromWei(
      weiTransferAmount
    )} cUSD`
  );

  kit.addAccount(privatekey);
  const stableTokenContract = await kit._web3Contracts.getStableToken();
  const txo = await stableTokenContract.methods.transfer(
    receiver,
    weiTransferAmount
  );
  const tx = await kit.sendTransactionObject(txo, { from: sender });
  console.info(`Sent tx object`);
  const hash = await tx.getHash();
  console.info(`Transferred ${amount} dollars to ${receiver}. Hash: ${hash}`);
  return hash;
}

const getSenderDetails = async (senderId) => {
  const user = await userAddressFromDB(senderId);
  console.log("my address is:", user[0].address);
};


//  check if user or sender exists
async function checkIfSenderExists(SenderId, senderMSISDN){
  // await checkIf
}

module.exports = router;

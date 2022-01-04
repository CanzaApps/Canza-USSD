const express = require('express')
const { ussdRouter } = require ('ussd-router')
const { CoinGeckoClient } = require('coingecko-api-v3') // initiate the CoinGecko API Client

const ContractKit = require('@celo/contractkit')

// imports models, utils, helpers, controllers and middlewares
const { createUser, getUserAddress, updateUser, verifyUser } = require('../controllers/users.controller')
const { createWallet, getAccountBalance, getAccountDetails, transfercUSD } = require('../services/generate-wallet')
const { sendMessage } = require('../config/at.config')
const { getTxIdUrl } = require('../services/short-urls')
const { encryptData, decryptData, formartNumber } = require('../utils')

const kit = ContractKit.newKit(process.env.TEST_NET_ALFAJORES)
// console.log("connected to celo!!!!", kit)
const router = express.Router()
const client = new CoinGeckoClient({ timeout: 10000, autoRetry: true })

router.post("/", async(req, res, next) => {
    res.set('Content-Type: text/plain')

    // user varibles 
    let firstName = ''
    let lastName = ''
    let email = ''
    let userNewPin = ''
    let confirmPin = ''


    const { body: { phoneNumber: phoneNumber, sessionId: sessionId, serviceCode: serviceCode  } } = req
    const { body: { text: rawText } } = req

    const text = ussdRouter(rawText)

    let msg = ''
    let senderMSISDN = phoneNumber.substring(1)
    const footer = '\n0: Back 00: Home'
    var data = text.split('*')

    let user = await getUserAddress(phoneNumber)
   
    // create new user if not exists 
    if(user.length <= 0) {
        // check if wallet is available 
        const wallet = await createWallet()
        createUser({ firstName: '', lastName: '', phoneNumber: phoneNumber, walletAddress: wallet.address, privateKey: wallet.privateKey, hashed_password: '00000'})
        
        // Todo: add message to alert user to verify their account 
        msg += `END Your wallet address have been created!\n Please Dial *384*868785# to verify your account!`
        res.send(msg)
    } 

    console.log("user details", user)

    // check if user isVerified 
    let isVerified = user[0].isVerified
    console.log(isVerified)

    if(!isVerified) {

    if (data[0] == null || data[0] == '') {
       
        msg = `CON Welcome to Canaza Finance. \nKindly Enter your details to verify your account.\n\nEnter new Pin`
        res.send(msg)
    } else if (data[0] !== '' && data[1] == null) {
       
        msg = `CON Reenter Pin to confirm`
        res.send(msg)
    } else if (data[0] !== '' && data[1] !== ''  && data[2] == null) {
        
        msg = `CON Please enter your First Name`
        res.send(msg)
    } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] == null) {
        
        msg = `CON Please enter your Last Name`;
        res.send(msg)
    } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] == null) {

        msg = `CON By accessing this app you agree to the terms and conditions.\n https://canzafinance.com/ \nSelect: \n1. Agree. \n2. Disagree`
        res.send(msg)
    } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] == '1') {
        userNewPin = data[0]
        confirmPin = data[1]
        firstName = data[2]
        lastName = data[3]
        
        let senderMSISDN = phoneNumber.substring(1)
        let encryptedPin = await encryptData(userNewPin.toString())
        console.log(confirmPin, userNewPin, firstName, lastName)
        console.log("encrypt data",encryptedPin)
        console.log("decrypt data",decryptData(encryptedPin))

        // check if pin match
        if(userNewPin === confirmPin && userNewPin.length >= 4) {
            senderMSISDN = phoneNumber
            // get user info to verify
            const user = await getUserAddress(phoneNumber)
            const userId = user[0]._id

            await verifyUser(userId) // change isVerified to true, save and update user account details
            await updateUser({userId, firstName: firstName, lastName: lastName, hashed_password: encryptedPin})
            
            // send user a welcome message
            let message_welcome = `Welcome to Canaza Finance. \nYour account details have been Verified. \n to access Canaza Services please Dial *384*868785#.\n Your access pin: ${userNewPin}`
            sendMessage(senderMSISDN, message_welcome)
            msg = `END Thank. \nYour Account will be verified shortly`
            res.send(msg)

        } else if (userNewPin.length < 4) {
            msg = `END Pin must be atleast 4 characters \n Retry again!!`
            res.send(msg)
        } else if (userNewPin !== confirmPin ) {
            msg = `END your access pin does not match \n Retry again!!`
            res.send(msg)
        }

    } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] == '2'){
        msg = `END Accept the terms & conditions to access Canaza Finance Services`
        res.send(msg)
    }
}

    else if (text === '') {
        msg = 'CON Welcome to Canza Finance:'
        msg += '\n1: Create Wallet'
        msg += '\n2: Send Money'
        msg += '\n3: Current Market Price'
        msg += '\n4: Defi and Swap'
        msg += '\n5: My Account'
        res.send(msg)
    } else if ( data[0] == '1' && data[1] == null ) {
        msg += `CON please enter your first name to create an account`
        res.send(msg)
    } else if (data[0] == '1' && data[1] !== '') {

        const user = await getUserAddress(phoneNumber)
        console.log("user details", user)
        
        // checks if the user address is available
        if (user.length <= 0) {
            firstName = data[1]
            const wallet = await createWallet()
            console.log("my name", firstName)
            console.log("wallet created", wallet)

            createUser({ firstName: firstName, phoneNumber, walletAddress: wallet.address, privateKey: wallet.privateKey })
            msg += `END your wallet address and account created!!!`

        } else {
            msg += "END wallet address already exist!!!"
        }
        
    } 
    // #1 send money
    else if (data[0] == '2' && data[1] == null) {
        msg += `CON Please Enter Recipient`
        res.send(msg) 
    } else if (data[0] == '2' && data[1] !== '' && data[2] == null) {
        msg += `CON Please Enter Amount to send`
        res.send(msg) 
    } 
    
    // transfer funds 
    else if (data[0] == '2' && data[1] !== '' && data[2] !== '' ) {
        senderMSISDN = phoneNumber
        receiverMSISDN = '+254' + data[1].substring(1) // Todo: change to nigeria phone code '+234'
        amount = data[2]

        // get sender's name
        const user = await getUserAddress(senderMSISDN)
        let senderName = user[0].firstName
        console.log("user name", senderName)
        
        let txReceipt = await transfercUSD(senderMSISDN, receiverMSISDN, amount)
        console.log('tx details', txReceipt)

        if(txReceipt === 'failed'){
            msg += `END Your transaction has failed due to insufficient balance`
            res.send(msg)  
            return
        }
        
        let url = await getTxIdUrl(txReceipt)
        console.log('tx URL', url)
        
        let message_to_sender = `KES ${amount} sent to ${receiverMSISDN}.\nTransaction URL: ${url}`
        let message_to_receiver = `You have received KES ${amount} from ${senderName}.\nTransaction Link: ${url}`

        sendMessage(senderMSISDN, message_to_sender)
        sendMessage(receiverMSISDN, message_to_receiver)
        
        msg += `END you have sent` + amount + ` to ` + receiverMSISDN + `Celo Account`
        res.send(msg)
    } 
    
    // #2 current market price from coingecko
    else if (data[0] == '3' && data[1] == null) {
        msg += `CON select any option to view current market data
        1. Bitcoin Current Price
        2. Etherum Currrent Price
        3. Celo Currrent Price`
        msg += footer
        res.send(msg)
    } else if ( data[0] == '3' && data[1] == '1') {
        const btc_ngn_usd = await client.simplePrice({ ids: ['bitcoin', 'bitcoin'], vs_currencies: ['ngn', 'usd'] })
        
        // bitcion market price in both Naira and USD
        let btc_price_ngn = formartNumber(btc_ngn_usd.bitcoin.ngn, 2)
        let btc_price_usd = formartNumber(btc_ngn_usd.bitcoin.usd, 2)
        
        msg += `END 1 BTC is: ` + btc_price_ngn + ` in Naira and ` + btc_price_usd + ` in USD`
        res.send(msg)
    } else if ( data[0] == '3' && data[1] == '2') {
        const eth_ngn_usd = await client.simplePrice({ ids: ['ethereum', 'ethereum'], vs_currencies: ['ngn', 'usd'] })
        
        // ethereum market price in both Naira and USD
        let eth_price_ngn = formartNumber(eth_ngn_usd.ethereum.ngn, 2)
        let eth_price_usd = formartNumber(eth_ngn_usd.ethereum.usd, 2)

        msg += `END 1 ETH is: ` + eth_price_ngn + ` in Naira and ` + eth_price_usd + ` in USD`
        res.send(msg)
    } else if ( data[0] == '3' && data[1] == '3') {
        const celo_ngn_usd = await client.simplePrice({ ids: ['celo', 'celo'], vs_currencies: ['ngn', 'usd'] })
        
        // celo market price in both Naira and USD
        let celo_price_ngn = formartNumber(celo_ngn_usd.celo.ngn, 2)
        let celo_price_usd = formartNumber(celo_ngn_usd.celo.usd, 2)

        msg += `END 1 CELO is: ` + celo_price_ngn + ` in Naira and ` + celo_price_usd + ` in USD` 
        res.send(msg)
    }
        else if (data[0] == '4' && data[1] == null){
        msg += `CON Defi Feature Coming soon`
        msg += footer
        res.send(msg)
    }
    
    // account details 
    else if (data[0] == '5' && data[1] == null){
        msg += `CON select account information you want to view
        1. Account Details
        2. Account Balance
        3. Password Reset`
        msg += footer
        res.send(msg)
    } else if (data[0] == '5' && data[1] == '1') {
        msg = await getAccountDetails(phoneNumber)
        res.send(msg)
    } else if (data[0] == '5' && data[1] == '2') {
        msg = await getAccountBalance(phoneNumber)
        res.send(msg)
    } else if (data[0] == '5' && data[1] == '3') {
        res.send(msg)
    }
    
    // select a correct option
    else {
        msg = 'CON Sorry, Please select an option'
        msg += '\n1: Create Wallet'
        msg += '\n2: Send Money'
        msg += '\n3: Current Market Price'
        msg += '\n4: Defi and Swap'
        msg += '\n5: My Account'
        res.send(msg)
    }
})

module.exports = router
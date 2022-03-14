const express = require('express')
const { ussdRouter } = require ('ussd-router')
const { CoinGeckoClient } = require('coingecko-api-v3') // initiate the CoinGecko API Client
const mailgun = require("mailgun-js")
const ContractKit = require('@celo/contractkit')

// imports models, utils, helpers, controllers and middlewares
const { createUser, getUserAddress, updateUser, checkAuth, verifyUser } = require('../controllers/users.controller')
const { createAgent, getAgentLocation } = require('../controllers/agents.controller')
const { createTransaction } = require('../controllers/transactions.controller')
const { createWallet, getAccountBalance, getAccountDetails, transfercUSD, buyCELO } = require('../services/generate-wallet')
const { sendMessage } = require('../config/at.config')
const { getTxIdUrl } = require('../services/short-urls')
const { sendEmail } = require('../config/mailgun.config')
const { generatePin, encryptionPin, generateVerificationId, formartNumber } = require('../utils')
const { verify } = require('crypto')

const kit = ContractKit.newKit(process.env.TEST_NET_ALFAJORES)
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: process.env.MAILGUN_DOMAIN })
// console.log("connected to celo!!!!", kit)
const router = express.Router()
const client = new CoinGeckoClient({ timeout: 10000, autoRetry: true })




router.post("/", async(req, res, next) => {
    res.set('Content-Type: text/plain')

    // const agentDoc = { 
    //     agentName:'Ifemide', 
    //     firstName: 'Ifemide', 
    //     lastName:'Ifemide', 
    //     phoneNumber: '+2348188434844', 
    //     agentLocation: 'Calabar', 
    //  }

    // const agentLocation = 'Calabar';

    // const agent = await getAgentLocation(agentLocation)

    //  console.log("agentDoc", agent)

    // await createAgent(agentDoc)

    // console.log('req.body', req.body)

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
    // let accountNumber  = phoneNumber.replace()
    // console.log('senderMSISDN', phoneNumber.replace(/\d{4}$/, '****'))
    const footer = '\n0: Back 00: Home'
    var data = text.split('*')

    let user = await getUserAddress(phoneNumber)
    

    // create new user if not exists 
    // if(user.length <= 0) {
    //     // check if wallet is available 
    //     const wallet = await createWallet()
    //     createUser({ firstName: '', lastName: '', phoneNumber: phoneNumber, walletAddress: wallet.address, privateKey: wallet.privateKey, hashed_password: '00000'})
    //     // Todo: add message to alert user to verify their account 
    //     msg += `END Your wallet address have been created! \n Please Dial *347*112# to verify your account!`
    //     res.send(msg)
    // } 
    
    // else { 
    //     msg += `END Your wallet address already exists! \n Please Dial *347*112# to verify your account!`
    //     res.send(msg)
    // }
    
    // console.log("user details", user)
    // check if user isVerified 
    // let isVerified = user[0].isVerified
    // console.log(isVerified)

    if (text === '') {
        msg = 'CON Welcome to to Canza Finance.'
        msg += '\n1: Create Account'
        msg += '\n2: Enter Your Pin'
        msg += '\n3: Forgot Pin'
        msg += '\n4: Help'
        res.send(msg)
    } 
    
    // create wallet
    else if (data[0] == '1' && data[1] == null) {
        msg = `CON Welcome to Canza Finance. \nKindly Enter your details to Verify and create an account.\n\nEnter new Pin`
        res.send(msg)
    } else if (data[0] == '1' && data[1] !== '' && data[2] == null) {
        const pin = data[1]
        console.log('pin', pin)
        msg = `CON Reenter Pin to confirm`
        res.send(msg)
    } else if (data[0] == '1' && data[1] !== '' && data[2] !== '' && data[3] == null) {
        const pin = data[2]
        console.log('pin 2', pin)
        msg = `CON Please enter your First Name`
        res.send(msg)
    } else if (data[0] == '1' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] == null) {
        const firstName = data[3]
        console.log('pin 2', firstName)
        msg = `CON Please enter your Last Name`
        res.send(msg)
    } else if (data[0] == '1' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] == null) {
        const lastName = data[4]
        console.log('pin 2', lastName)
        msg = `CON By accessing this app you agree to the terms and conditions.\n https://canzafinance.com/\nPress 1 or 2.`
        msg += '\n1. Agree.'
        msg += '2. Disagree'
        res.send(msg)
    } else if (data[0] == '1' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] == '1' && data[6] == null) {
        userNewPin = data[1]
        confirmPin = data[2]
        firstName = data[3]
        lastName = data[4]
        fullname = `${firstName} ${lastName}`

        let senderMSISDN = phoneNumber.substring(1)
        let hashed_password = encryptionPin(userNewPin.toString())
        console.log(confirmPin, userNewPin, firstName, lastName, fullname)
        console.log("encrypt data", hashed_password)

        // check if access pin match
        if (userNewPin === confirmPin && userNewPin.length >= 4) {
            // check if user already exists
            if(user.length <= 0) {
                // check if wallet is available 
                const wallet = await createWallet()
                createUser({ firstName: firstName, lastName: lastName, phoneNumber: phoneNumber, walletAddress: wallet.address, privateKey: wallet.privateKey, hashed_password: hashed_password})
                
                // get user info to verify
                const user = await getUserAddress(phoneNumber)
                console.log("user", user)
                // const userId = user[0]._id

                // await verifyUser(userId) // change isVerified to true, save and update user account details
                
                // Todo: add message to alert user to verify their account
                let messageWelcome = `Hello ${fullname}, Welcome to Canza Finance.\nYour Canza account have been Verified. \nYour account number is ${phoneNumber.replace(/\d{4}$/, '****')} \nDial *347*112# to access your wallet.\n Your access pin: ${userNewPin.replace(/\d{2}$/, '**')}`
                sendMessage(phoneNumber, messageWelcome) 

                msg += `END Thank you. \nYour account have been created and will be verified shortly.\nPlease check your SMS for updates.`
                res.send(msg)
            } 
            // else if (!isVerified) {
            //     // get user info to verify
            //     const user = await getUserAddress(phoneNumber)
            //     const userId = user[0]._id
                
            //     updateBody = { firstName, lastName, hashed_password }
            //     console.log("user info to update", updateBody)
                
            //     await verifyUser(userId) // change isVerified to true, save and update user account details
            //     await updateUser(userId, updateBody)

            //     let messageWelcome = `Hello ${fullname}, Welcome to Canza Finance.\nYour Canza account have been Verified. \nYour account number is ${phoneNumber.replace(/\d{4}$/, '****')} \nDial *347*112# to access your wallet.\n Your access pin: ${userNewPin}`
            //     sendMessage(senderMSISDN, messageWelcome) 

            //     msg += `END Thank you. \nYour account is verified please check your SMS for updates.`
            //     res.send(msg)
            // } 
            else { 
                msg += `END Your wallet address already exists! \n Please Dial *347*112# to Canza services!`
                res.send(msg)
            }
        } else if (userNewPin.length < 4) {
            msg = `END Pin must be atleast 4 characters \n Retry again!!`
            res.send(msg)
        } else if (userNewPin !== confirmPin ) {
            msg = `END your access pin does not match \n Retry again!!`
            res.send(msg)
        }

    } else if (data[0] == '2' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] == '2' && data[6] == null) {
        msg = `END Accept the terms & conditions to access Canza Finance Services`
        res.send(msg)
    }
    
    // login user
    else if (data[0] == '2' && data[1] == null) {
        senderMSISDN = phoneNumber
        // get user's name
        const user = await getUserAddress(senderMSISDN)
        let userName = user[0].firstName
        msg = `CON Welcome to Canza Finance ${userName}.\nPlease select an option below.`
        msg += '\n1. Send'
        msg += '\n2. Buy'
        msg += '\n3. Sell'
        msg += '\n4. Market Prices'
        msg += '\n5. Swap'
        msg += '\n6. My Account'
        res.send(msg)
    } 
    // Transfer Funds
    else if (data[0] == '2' && data[1] == '1' && data[2] == null) {
        msg += `CON Please Enter Recipient`
        res.send(msg) 
        // check if pin match user input pin
        //   if(currentUserPin === en_userInputPin) {

        //   } else {
        //       msg = `END Your pin is incorrect.\nPlease try again.`
        //       res.send(msg)
        //   }
    }  else if (data[0] == '2' && data[1] == '1' && data[2] !== '' && data[3] == null) { 
        msg += `CON Please Enter Amount to Transfer`
        res.send(msg) 
    } else if (data[0] == '2' && data[1] == '1' && data[2] !== '' && data[3] !== '' && data[4] == null) {
        amount = data[3]
        console.log('amount', amount)
        msg += `CON Please Enter your access Pin`
        res.send(msg) 
    } else if (data[0] == '2' && data[1] == '1' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] == null) {
        senderMSISDN = phoneNumber
        receiverMSISDN = '+254' + data[2].substring(1) // Todo: change to nigeria phone code '+234'
        amount = data[3]
        userInputPin = data[4]
        en_userInputPin = encryptionPin(userInputPin.toString())

        console.log("userInputPin", userInputPin, en_userInputPin, receiverMSISDN, 'amout to send', amount)

        // get sender's name
        const user = await getUserAddress(senderMSISDN)
        let firstName = user[0].firstName
        let lastName = user[0].lastName
        const currentUserPin  = user[0].hashed_password
        const senderName = `${firstName} ${lastName}`

        // check if pin match user input pin
        if(currentUserPin === en_userInputPin) {
            console.log('pin match good')
            
            let txReceipt = await transfercUSD(senderMSISDN, receiverMSISDN, amount)
            console.log('tx details', txReceipt)

            if(txReceipt === 'failed'){
                msg += `END Your transaction has failed due to insufficient balance`
                res.send(msg)
                return
            }

            // save transaction details
            let txHash = txReceipt.transactionHash
            let txUrl = await getTxIdUrl(txHash)
            console.log('tx URL', txUrl)
            
            let message_to_sender = `${amount} NGN sent to ${receiverMSISDN}.\nTransaction URL: ${txUrl}`
            let message_to_receiver = `You have received ${amount} NGN from ${senderName}.\nTransaction URL: ${txUrl}`
            
            sendMessage(senderMSISDN, message_to_sender)
            sendMessage(receiverMSISDN, message_to_receiver)

            msg += `END Your transaction has been completed.\nTransaction URL: ${txUrl}`
            // msg += `END Your transaction has been completed. You have sent ${amount} cUSD to ${receiverMSISDN}`
            res.send(msg)
        }
    }
    
    // Buy Funds
    else if (data[0] == '2' && data[1] == '2' && data[2] == null) {
        msg += `CON Please select coin to Buy
        1. cUSD
        2. USDC
        3. BTC
        4. ETH
        5. CNZA
        6. CLGD`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] == null) {
        msg+= `CON Enter amount to buy`
        res.send(msg)    
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] !== '' && data[4] == null) {
        msg += `CON Please select cash Drop off location
        1. Calabar
        2. Ibadan
        3. Cross River
        4. Akwa Ibom`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] == null) {
        msg += `CON Please select Your LGA
        1. Biase LGA
        2. Akpabuyo LGA
        3. Akampkpa LGA`
        res.send(msg)    
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == null) {
        msg += `CON Please select the Buyer 
        1. My self
        2. Another person`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '1' && data[7] == null) {
        msg += `CON Please add Remarks for your transaction (Buy Celo)`
        res.send(msg)  
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '1' && data[7] !== '' && data[8] == null) {
        msg += `CON Please enter your access pin to confirm purchase of ${data[3]} `
        res.send(msg) 
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '1' && data[7] !== '' && data[8] !== '' && data[9] !== '' && data[10] == null) {
        senderMSISDN = phoneNumber
        escrowMSISDN = '+2549161037900'  // Todo: change to nigeria phone code '+234' escrowMSISDN
        agentMSISDN = '+2348188434844'  // Todo: add agent phone number

        coinToBuy = data[2]
        amountToBuy = data[3]
        cashPickupLocation = data[4]
        localGovernmentArea = data[5]
        pickupPerson = data[6]
        remarks = data[7]
        userInputPin = data[8]

        // amount = kit.web3.utils.toWei(`${_amount}`)

        en_userInputPin = encryptionPin(userInputPin.toString())
        verificationId = generateVerificationId()

        // cashPickupLocation
        if(data[4]==='1'){cashPickupLocation = 'Calabar'}
        else if (data[4]==='2'){cashPickupLocation = 'Ibadan'}
        else if (data[4]==='3'){cashPickupLocation = 'Cross River'}
        else if (data[4]==='4'){cashPickupLocation = 'Akwa-Ibom'}
        else{cashPickupLocation = 'Ibadan'}
        
        // localGovArea
        if (data[5]==='1'){localGovernmentArea = 'Biase LGA'}
        else if(data[5]==='2'){localGovernmentArea = 'Akpabuyo LGA'}
        else if(data[5]==='3'){localGovernmentArea = 'Akampkpa LGA'}
        else{localGovernmentArea = 'Biase LGA'}

        // buying for person
        if( data[6]==='1'){pickupPerson = 'My self'}
        else if (data[6]==='2'){pickupPerson = 'Another person'}
        else{pickupPerson = 'My self'}

        
        console.log('cashPickupLocation', cashPickupLocation, 'localGovernmentArea', localGovernmentArea, 'pickupPerson', pickupPerson, 'remarks', remarks, 'verificationId', verificationId, 'escrowMSISDN', escrowMSISDN, 'agentMSISDN', agentMSISDN, 'senderMSISDN', senderMSISDN, 'coinToBuy', coinToBuy, 'amountToBuy', amountToBuy)

        // get buyers information
        const user = await getUserAddress(senderMSISDN)
        let userId = user[0]._id
        let buyerFirstName = user[0].firstName
        let buyerLastName = user[0].lastName
        const buyerFullName = buyerFirstName + ' ' + buyerLastName
        const currentUserPin = user[0].hashed_password
        const buyerAddress = user[0].walletAddress
        
        // check if pin match user input pin
        if(currentUserPin === en_userInputPin) {
            
            //Todo add order to db
            

            let message_to_buyer = `you have created a buy order for ${amountToBuy} ${coinToBuy} verification Id ${verificationId}. Please wait for the Canza agent to confirm your transaction.`
            let message_to_agent = `${buyerFullName} has placed a  buy order of ${amountToBuy} ${coinToBuy} from you. verrification Id ${verificationId}.`
            let message_to_canza = `${buyerFullName} has placed a  buy order of ${amountToBuy} ${coinToBuy} from you. verrification Id ${verificationId}.`
            
            sendMessage(senderMSISDN, message_to_buyer)
            sendMessage(agentMSISDN, message_to_agent)
            sendMessage(escrowMSISDN, message_to_canza)

            // send email to canza
            const data = {
                subject: 'New Buy Order',
                text: `You have recived a buy order of ${amountToBuy} ${coinToBuy} from ${buyerFullName} \nVerification ID ${verificationId}. \nPlease contact the user to arrange a meeting with a Canza Agent ${agentMSISDN} for pickup location ${cashPickupLocation}.`
            }
            
            // send order confirmation email @canza.io            
            // await sendEmail('k.achinonu@canza.io', data)
            
            msg += `END Your buy order has been placed.\n Kindly wait for the Canza agent to confirm your order.`
            res.send(msg)
        
        } else {
            msg += `END Your access pin does not match \n Please Retry again!!`
            res.send(msg)
        }
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '2' && data[7] == null) {
        msg += `CON Please enter recipient's phone number`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '2' && data[7] !== '' && data[8] == null) {
        msg += `CON Please add remarks \n (I want to buy coins for another person)`
        res.send(msg) 
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '2' && data[7] !== '' && data[8] !== '' && data[9] == null) {
        msg += `CON Please enter your access pin to confirm purchase of ${data[3]} `
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '2' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '2' && data[7] !== '' && data[8] !== '' && data[9] !== '' && data[10] == null) {
        senderMSISDN = phoneNumber
        escrowMSISDN = '+2549161037900'  // Todo: change to nigeria phone code '+234' escrowMSISDN
        agentMSISDN = '+2348188434844'  // Todo: add agent phone number

        coinToBuy = data[2]
        amountToBuy = data[3]
        cashPickupLocation = data[4]
        localGovernmentArea = data[5]
        pickupPerson = data[6]
        remarks = data[7]
        userInputPin = data[8]
        
        // amount = kit.web3.utils.toWei(`${_amount}`)

        en_userInputPin = encryptionPin(userInputPin.toString())
        verificationId = generateVerificationId()

        // cashPickupLocation
        if(data[4]==='1'){cashPickupLocation = 'Calabar'}
        else if (data[4]==='2'){cashPickupLocation = 'Ibadan'}
        else if (data[4]==='3'){cashPickupLocation = 'Cross River'}
        else if (data[4]==='4'){cashPickupLocation = 'Akwa-Ibom'}
        else{cashPickupLocation = 'Ibadan'}

        // localGovArea
        if (data[5]==='1'){localGovernmentArea = 'Biase LGA'}
        else if(data[5]==='2'){localGovernmentArea = 'Akpabuyo LGA'}
        else if(data[5]==='3'){localGovernmentArea = 'Akampkpa LGA'}
        else{localGovernmentArea = 'Biase LGA'}

        // buying for person
        if( data[6]==='1'){pickupPerson = 'My self'}
        else if (data[6]==='2'){pickupPerson = 'Another person'}
        else{pickupPerson = 'My self'}

        console.log('cashPickupLocation', cashPickupLocation, 'localGovernmentArea', localGovernmentArea, 'pickupPerson', pickupPerson, 'remarks', remarks, 'verificationId', verificationId, 'escrowMSISDN', escrowMSISDN, 'agentMSISDN', agentMSISDN, 'senderMSISDN', senderMSISDN, 'coinToBuy', coinToBuy, 'amountToBuy', amountToBuy)

        const user = await getUserAddress(senderMSISDN)
        console.log('user', user)
        
    }
    
    // Sell Crypto
    else if (data[0] == '2' && data[1] == '3' && data[2] == null) {
        msg += `CON Please select coin to sell
        1. cUSD
        2. USDC
        3. BTC
        4. ETH
        5. CNZA
        6. CLGD`
        res.send(msg) 
    } else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] == null) {
        msg += `CON Please enter amount to sell`
        res.send(msg) 
    } else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] !== '' && data[4] == null) {
        msg += `CON Please select cash pickup location
        1. Calabar
        2. Ibadan
        3. Cross River
        4. Akwa Ibom`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] == null) {
        msg += `CON Please select Your LGA
        1. Biase LGA
        2. Akpabuyo LGA
        3. Akampkpa LGA`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == null) {
        msg += `CON Please select the pickup person
        1. My self
        2. Another person`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '1' && data[7] == null) {
        msg += `CON Please add Remarks for your transaction (Sell cUSD)`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '1' && data[7] !== '' && data[8] == null) {	
        msg += `CON Please enter your access pin to confirm to sell cUSD`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '1' && data[7] !== '' && data[8] !== '' && data[9] !== '' && data[10] == null) {
        sellerMSISDN = phoneNumber
        escrowMSISDN = '+2549161037900'  // Todo: change to nigeria phone code '+234' escrowMSISDN
        agentMSISDN = '+2348188434844'  // Todo: add agent phone number

        coinToSell = data[2]
        amountToSell = data[3]
        cashPickupLocation = data[4]
        localGovernmentArea = data[5]
        pickupPerson = data[6]
        remarks = data[7]
        userInputPin = data[8]

        en_userInputPin = encryptionPin(userInputPin.toString())
        verificationId = generateVerificationId()

        // cashPickupLocation
        if(data[4]==='1'){cashPickupLocation = 'Calabar'}
        else if (data[4]==='2'){cashPickupLocation = 'Ibadan'}
        else if (data[4]==='3'){cashPickupLocation = 'Cross River'}
        else if (data[4]==='4'){cashPickupLocation = 'Akwa-Ibom'}
        else{cashPickupLocation = 'Ibadan'}
        
        // localGovArea
        if (data[5]==='1'){localGovernmentArea = 'Biase LGA'}
        else if(data[5]==='2'){localGovernmentArea = 'Akpabuyo LGA'}
        else if(data[5]==='3'){localGovernmentArea = 'Akampkpa LGA'}
        else{localGovernmentArea = 'Biase LGA'}

        // pickup person
        if( data[6]==='1'){pickupPerson = 'My self'}
        else if (data[6]==='2'){pickupPerson = 'Another person'}
        else{pickupPerson = 'My self'}

        console.log('coinToSell', coinToSell, 'amountToSell', amountToSell, 'cashPickupLocation', cashPickupLocation, 'localGovernmentArea', localGovernmentArea, 'pickupPerson', pickupPerson, 'remarks', remarks, 'userInputPin', userInputPin)
        
        // get seller info 
        const user = await getUserAddress(phoneNumber)
        let senderFirstName = user[0].firstName
        let senderLastName = user[0].lastName
        let userId = user[0]._id
        const userFullName = senderFirstName + ' ' + senderLastName
        const currentUserPin = user[0].hashed_password

        console.log('user wallet', user[0].walletAddress)

        // check if pin match user input pin
        if(currentUserPin === en_userInputPin) {
            console.log('pin match good')
            
            let txReceipt = await transfercUSD(sellerMSISDN, escrowMSISDN, amountToSell)
            console.log('tx details', txReceipt)
            
            if(txReceipt === 'failed'){
                msg += `END Your transaction has failed due to insufficient balance`
                res.send(msg)
                return
            }
            
            let transactionUrl = await getTxIdUrl(txReceipt)
            console.log('tx URL', transactionUrl)

            // save transaction to db
            const transactionDoc = { userId, coinToSell, amountToSell, cashPickupLocation, localGovernmentArea, remarks, pickupPerson, verificationId, transactionUrl }
            await createTransaction(transactionDoc)
            
            let message_to_sell = `Your transaction has been completed. ${amountToSell} NGN has been sent to Canza escrow ${escrowMSISDN}.\nTransaction URL: ${transactionUrl} \nVerification ID ${verificationId}.`
            let message_to_seller = `You have a cash pick-up order for ${amountToSell} NGN. In order to pick up your cash, schedule a meeting with a Canza Agent. Call or text 008654324 \nTransaction URL: ${transactionUrl}`
            let message_to_canza = `You have recived a cash pickup order of ${amountToSell} NGN from ${sellerMSISDN}, ${userFullName}.\nTransaction Link: ${transactionUrl} \nVerification ID ${verificationId}.`
            let message_to_agent = `You have received  a request from Canza Finance to give ${sellerMSISDN}, ${amountToSell} NGN .\nTransaction URL: ${transactionUrl} \nVerificaction ID ${verificationId}`
            
            sendMessage(sellerMSISDN, message_to_sell)
            sendMessage(sellerMSISDN, message_to_seller)
            sendMessage(escrowMSISDN, message_to_canza)
            sendMessage(agentMSISDN, message_to_agent)

            // send email to canza escrow
            const data = {
                subject: 'New Cash Pickup Order',
                text: `You have recived a request from Canza finance to give ${sellerMSISDN}, ${userFullName}, amount ${amountToSell} NGN \nTransaction Link: ${transactionUrl} \nVerification ID ${verificationId}. \nPlease contact the user to arrange a meeting with a Canza Agent ${agentMSISDN} for pickup location ${cashPickupLocation}.`
            }

            // send order confirmation email @canza.io            
            await sendEmail('k.achinonu@canza.io', data)

            msg += `END Your transaction has been completed.\nTransaction Link: ${transactionUrl}`
            res.send(msg)
        }
         else {
            msg = `END Your access pin does not match \n Please Retry again!!`
            res.send(msg)
        }
    } 
    
    else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '2' && data[7] == null) {
        msg += `CON Please enter recipient's phone number`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '2' && data[7] !== '' && data[8] == null) {
        msg += `CON Please add remarks for the recipient \n (I want you to pick up my cash at Canza agent)`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '2' && data[7] !== '' && data[8] !== '' && data[9] == null) {
        msg += `CON Please enter your access pin to confirm to sell cUSD`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '3' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] !== '' && data[6] == '2' && data[7] !== '' && data[8] !== '' && data[9] !== '' && data[10] == null) {
        sellerMSISDN = phoneNumber
        escrowMSISDN = '+2549161037900'  // Todo: change to nigeria phone code '+234' escrowMSISDN
        agentMSISDN = '+2348188434844'  // Todo: add agent phone number

        console.log('sellerMSISDN', sellerMSISDN, 'escrowMSISDN', escrowMSISDN)

        coinToSell = data[2]
        amountToSell = data[3]
        cashPickupLocation = data[4]
        localGovernmentArea = data[5]
        pickupPerson = data[6]
        recipientMSISDN = data[7]
        remarks = data[8]
        userInputPin = data[9]

        en_userInputPin = encryptionPin(userInputPin.toString())
        verificationId = generateVerificationId()

        // cashPickupLocation
        if(data[4]==='1'){cashPickupLocation = 'Calabar'}
        else if (data[4]==='2'){cashPickupLocation = 'Ibadan'}
        else if (data[4]==='3'){cashPickupLocation = 'Cross River'}
        else if (data[4]==='4'){cashPickupLocation = 'Akwa-Ibom'}
        else{cashPickupLocation = 'Ibadan'}

        // localGovArea
        if (data[5]==='1'){localGovernmentArea = 'Biase LGA'}
        else if(data[5]==='2'){localGovernmentArea = 'Akpabuyo LGA'}
        else if(data[5]==='3'){localGovernmentArea = 'Akampkpa LGA'}
        else{localGovernmentArea = 'Biase LGA'}

        // pickup person
        if( data[6]==='1'){pickupPerson = 'My self'}
        else if (data[6]==='2'){pickupPerson = 'Another person'}
        else{pickupPerson = 'My self'}

        console.log('coinToSell', coinToSell, 'amountToSell', amountToSell, 'cashPickupLocation', cashPickupLocation, 'localGovernmentArea', localGovernmentArea, 'pickupPerson', pickupPerson, 'remarks', remarks, 'userInputPin', userInputPin, 'recipientMSISDN', recipientMSISDN)

        // get seller info 
        const user = await getUserAddress(phoneNumber)
        let senderFirstName = user[0].firstName
        let senderLastName = user[0].lastName
        const userFullName = senderFirstName + '' + senderLastName
        const currentUserPin = user[0].hashed_password

        // check if pin match user input pin
        if(currentUserPin === en_userInputPin) {
            console.log('pin match good')

            let txReceipt = await transfercUSD(sellerMSISDN, escrowMSISDN, amountToSell)
            console.log('tx details', txReceipt)
            
            if(txReceipt === 'failed'){
                msg += `END Your transaction has failed due to insufficient balance`
                res.send(msg)
                return
            }
            
            let transactionUrl = await getTxIdUrl(txReceipt)
            console.log('tx URL', transactionUrl)

            // save transaction to db
            const transactionDoc = { coinToSell, amountToSell, cashPickupLocation, localGovernmentArea, remarks, pickupPerson, verificationId, transactionUrl }
            await createTransaction(transactionDoc)
            

            let message_to_sell = `Your transaction has been completed. ${amountToSell} NGN has been sent to Canza escrow ${escrowMSISDN}.\nTransaction URL: ${transactionUrl} \nVerification ID ${verificationId}.`
            let message_to_seller = `You have a cash pick-up order for ${amountToSell} NGN. In order to pick up your cash, schedule a meeting with a Canza Agent. Call or text 008654324 \nTransaction URL: ${transactionUrl}`
            let message_to_recipient = `You have a cash pick-up order for ${amountToSell} NGN for ${sellerMSISDN}.`
            let message_to_canza = `You have recived ${amountToSell} NGN from ${sellerMSISDN}, ${userFullName}.\nTransaction Link: ${transactionUrl} \nVerification ID ${verificationId}.`
            let message_to_agent = `You have received  a request from Canza Finance to give ${sellerMSISDN}, ${amountToSell} NGN .\nTransaction URL: ${transactionUrl} \nVerificaction ID ${verificationId}`

            sendMessage(sellerMSISDN, message_to_sell)
            sendMessage(sellerMSISDN, message_to_seller)
            sendMessage(recipientMSISDN, message_to_recipient)
            sendMessage(escrowMSISDN, message_to_canza)
            sendMessage(agentMSISDN, message_to_agent)

            // send email to canza escrow
            const data = {
                subject: 'New Cash Pickup Order',
                text: `You have recived a request from Canza finance to give ${recipientMSISDN}, amount ${amountToSell} NGN \nTransaction Link: ${transactionUrl} \nVerification ID ${verificationId}. \nPlease contact the user to arrange a meeting with a Canza Agent ${agentMSISDN} for pickup location ${cashPickupLocation}.`
            }

            // send order confirmation email            
            await sendEmail('k.achinonu@canza.io', data)

            msg += `END Your transaction has been completed.\nTransaction Link: ${url}`
            res.send(msg)
        } else {
            msg = `END Your access pin does not match \n Please Retry again!!`
            res.send(msg)
        }
    }

    // market price
    else if (data[0] == '2' && data[1] == '4' && data[2] == null) {
        msg += `CON select any option to view current market data
        1. Bitcoin Current Price
        2. Etherum Currrent Price
        3. Celo Currrent Price`
        msg += footer
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '4' && data[2] == '1' && data[3] == null) {
        const btc_ngn_usd = await client.simplePrice({ ids: ['bitcoin', 'bitcoin'], vs_currencies: ['ngn', 'usd'] })
        
        // bitcion market price in both Naira and USD
        let btc_price_ngn = formartNumber(btc_ngn_usd.bitcoin.ngn, 2)
        let btc_price_usd = formartNumber(btc_ngn_usd.bitcoin.usd, 2)
        msg += `END Bitcoin Current Price in Naira: ${btc_price_ngn} \n Bitcoin Current Price in USD: ${btc_price_usd}`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '4' && data[2] == '2' && data[3] == null) {
        const eth_ngn_usd = await client.simplePrice({ ids: ['ethereum', 'ethereum'], vs_currencies: ['ngn', 'usd'] })

        // ethereum market price in both Naira and USD
        let eth_price_ngn = formartNumber(eth_ngn_usd.ethereum.ngn, 2)
        let eth_price_usd = formartNumber(eth_ngn_usd.ethereum.usd, 2)

        msg += `END Ethereum Current Price in Naira: ${eth_price_ngn} \n Ethereum Current Price in USD: ${eth_price_usd}`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '4' && data[2] == '3' && data[3] == null) {
        const celo_ngn_usd = await client.simplePrice({ ids: ['celo', 'celo'], vs_currencies: ['ngn', 'usd'] })

        // celo market price in both Naira and USD
        let celo_price_ngn = formartNumber(celo_ngn_usd.celo.ngn, 2)
        let celo_price_usd = formartNumber(celo_ngn_usd.celo.usd, 2)

        msg += `END Celo Current Price in Naira: ${celo_price_ngn} \n Celo Current Price in USD: ${celo_price_usd}`
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '5' && data[2] == null) {
        msg += `CON Defi swaping Feature Coming soon`
        msg += footer
        res.send(msg)
    } 
    
    // account details
    else if (data[0] == '2' && data[1] == '6' && data[2] == null) {
        msg += `CON select any option to view account Details`
        msg += `\n1. Account Details`
        msg += `\n2. Account Balance`
        msg += footer
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '6' && data[2] == '1' && data[3] == null) {
        msg += await getAccountDetails(phoneNumber)
        res.send(msg)
    } else if (data[0] == '2' && data[1] == '6' && data[2] == '2' && data[3] == null) {
        msg += await getAccountBalance(phoneNumber)
        res.send(msg)
    }
    
    // forgot pin
    else if (data[0] == '3' && data[1] == null) {
        msg = `END To reset your access pin please Contact Canza Support`
        senderMSISDN = phoneNumber
        let reset_pin_message = `You have made a request to reset your Canza wallet pin.\nTo do this, we will need you to be identified by a Canza Agent.\nPlease call or text 08099999994 for physical identification.`
        sendMessage(senderMSISDN, reset_pin_message)
        res.send(msg)
    } 
    // help
    else if (data[0] == '4' && data[1] == null)  { 
        msg = `END Help is on the way\n Please call or text 08099999994 for help`
        res.send(msg)
    }





//     if(!isVerified) {

//     if (data[0] == null || data[0] == '') {
       
//         msg = `CON Welcome to Canza Finance. \nKindly Enter your details to verify your account.\n\nEnter new Pin`
//         res.send(msg)
//     } else if (data[0] !== '' && data[1] == null) {
       
//         msg = `CON Reenter Pin to confirm`
//         res.send(msg)
//     } else if (data[0] !== '' && data[1] !== ''  && data[2] == null) {
        
//         msg = `CON Please enter your First Name`
//         res.send(msg)
//     } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] == null) {
        
//         msg = `CON Please enter your Last Name`;
//         res.send(msg)
//     } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] == null) {

//         msg = `CON By accessing this app you agree to the terms and conditions.\n https://canzafinance.com/ \nPress 1 or 2: \n1. Agree. \n2. Disagree`
//         res.send(msg)
//     } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] == '1') {
//         userNewPin = data[0]
//         confirmPin = data[1]
//         firstName = data[2]
//         lastName = data[3]
//         fullname = `${firstName} ${lastName}`
                
//         let senderMSISDN = phoneNumber.substring(1)
//         let hashed_password = encryptionPin(userNewPin.toString())
//         console.log(confirmPin, userNewPin, firstName, lastName)
//         console.log("encrypt data", hashed_password)

//         // check if pin match
//         if(userNewPin === confirmPin && userNewPin.length >= 4) {
//             senderMSISDN = phoneNumber
//             // get user info to verify
//             const user = await getUserAddress(phoneNumber)
//             const userId = user[0]._id

//             updateBody = { firstName, lastName, hashed_password }
//             console.log("user info to update", updateBody)

//             await verifyUser(userId) // change isVerified to true, save and update user account details
//             await updateUser(userId, updateBody)
            
//             // send user a welcome message
//             let message_welcome = `Hello ${fullName}, Welcome to Canza Finance. \nYour Canza account have been Verified. \nYour account number is ${senderMSISDN} \nDial *347*112# to access your wallet.\n Your access pin: ${userNewPin}`
//             sendMessage(senderMSISDN, message_welcome)
//             msg = `END Thank you. \nYour account will be verified shortly please check your SMS for updates.`
//             res.send(msg)

//         } else if (userNewPin.length < 4) {
//             msg = `END Pin must be atleast 4 characters \n Retry again!!`
//             res.send(msg)
//         } else if (userNewPin !== confirmPin ) {
//             msg = `END your access pin does not match \n Retry again!!`
//             res.send(msg)
//         }

//     } else if (data[0] !== '' && data[1] !== ''  && data[2] !== '' && data[3] !== '' && data[4] == '2'){
//         msg = `END Accept the terms & conditions to access Canza Finance Services`
//         res.send(msg)
//     }
// }

//     else if (text === '') {
//         msg = 'CON Welcome to Canza Finance:'
//         msg += '\n1: Send'
//         msg += '\n2: Sell'
//         msg += '\n3: Market Prices'
//         msg += '\n4: Swap'
//         msg += '\n5: My Account'
//         res.send(msg)
//     } 
    
//     // create wallet not need here 
//     // else if ( data[0] == '1' && data[1] == null ) {
//     //     msg += `CON please enter your first name to create an account`
//     //     res.send(msg)
//     // } 

//     // else if (data[0] == '1' && data[1] !== '') {

//     //     const user = await getUserAddress(phoneNumber)
//     //     console.log("user details", user)
        
//     //     // checks if the user address is available
//     //     if (user.length <= 0) {
//     //         firstName = data[1]
//     //         const wallet = await createWallet()
//     //         console.log("my name", firstName)
//     //         console.log("wallet created", wallet)

//     //         createUser({ firstName: firstName, phoneNumber, walletAddress: wallet.address, privateKey: wallet.privateKey })
//     //         msg += `END your wallet address and account created!!!`

//     //     } else {
//     //         msg += "END wallet address already exist!!!"
//     //     }
        
//     // } 
    
//     // #1 send money
//     else if (data[0] == '1' && data[1] == null) {
//         msg += `CON Please Enter Recipient`
//         res.send(msg) 
//     } else if (data[0] == '1' && data[1] !== '' && data[2] == null) {
//         msg += `CON Please Enter Amount to send`
//         res.send(msg) 
//     } 

//     // confirm pin
//     else if (data[0] == '1' && data[1] !== '' && data[2] !== '' && data[3] == null) { 
//         msg += `CON Please Enter your access Pin`
//         res.send(msg) 
//     }

//     // transfer funds 
//     else if (data[0] == '1' && data[1] !== '' && data[2] !== '' ) {
//         senderMSISDN = phoneNumber
//         receiverMSISDN = '+254' + data[1].substring(1) // Todo: change to nigeria phone code '+234'
//         amount = data[2]
//         userInputPin = data[3]
//         en_userInputPin = encryptionPin(userInputPin.toString())

//         // get sender's name
//         const user = await getUserAddress(senderMSISDN)
//         let senderName = user[0].firstName
//         const currentUserPin  = user[0].hashed_password

//         // check if pin match user input pin
//         if(currentUserPin === en_userInputPin) {
//             console.log('pin match good')
            
//             let txReceipt = await transfercUSD(senderMSISDN, receiverMSISDN, amount)
//             console.log('tx details', txReceipt)
            
//             if(txReceipt === 'failed'){
//                 msg += `END Your transaction has failed due to insufficient balance`
//                 res.send(msg)
//                 return
//             }
            
//             let url = await getTxIdUrl(txReceipt)
//             console.log('tx URL', url)
            
//             let message_to_sender = `KES ${amount} sent to ${receiverMSISDN}.\nTransaction URL: ${url}`
//             let message_to_receiver = `You have received KES ${amount} from ${senderName}.\nTransaction Link: ${url}`
            
//             sendMessage(senderMSISDN, message_to_sender)
//             sendMessage(receiverMSISDN, message_to_receiver)
            
//             msg += `END you have sent ` + amount + ` cUSD to ` + receiverMSISDN + `Celo Account`
//             res.send(msg)

//         } else if (currentUserPin !== en_userInputPin) {
//             msg = `END Your access pin does not match \n Retry again!!`
//             res.send(msg)
//         }  
//     } 
    
//     // #2 sell coins
//     else if (data[0] == '2' && data[1] == null) {
//         msg += `CON Please select coin to sell
//         1. cUSD
//         2. USDC
//         3. BTC
//         4. ETH
//         5. CNZA
//         6. CLGD`
//         res.send(msg) 
//     } else if (data[0] == '2' && data[1] !== '' && data[2] == null) {
//         msg += `CON Please enter amount to sell`
//         res.send(msg)
//     } else if (data[0] == '2' && data[1] !== '' && data[2] !== '' && data[3] == null){
//         msg += `CON Please select cash pickup location
//         1. Ikeja
//         2. Ibadan
//         3. Cross River
//         4. Akwa Ibom`
//         res.send(msg)
//     } else if (data[0] == '2' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] == null){
//         msg += `CON Please select Your LGA
//         1. Biase LGA
//         2. Akpabuyo LGA
//         3. Akampkpa LGA`
//         res.send(msg)
//     } else if (data[0] == '2' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] == null){
//         msg += `CON Please select a recipient
//         1. My self
//         2. Another person`
//         res.send(msg)
//     } else if (data[0] == '2' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] == '1') {
//         sellerMSISDN = phoneNumber
//         escrowMSISDN = phoneNumber // Todo: change to nigeria phone code '+234'
//         agentMSISDN = phoneNumber  // Todo: add agent phone number
//         amountToSell = data[2]
//         userInputPin = data[3]
//         en_userInputPin = encryptionPin(userInputPin.toString())
//         pickupLocation = data[4]

//         msg += `CON Please enter your access pin to confirm to sell cUSD and Cash Pickup by Myself ${phoneNumber}`
        
//         // get sender's name 
//         const user = await getUserAddress(phoneNumber)
//         let senderFirstName = user[0].firstName
//         let senderLastName = user[0].lastName
//         const userFullName = senderFirstName + '' + senderLastName
//         const currentUserPin = user[0].hashsed_password

//         let txReceipt = await transfercUSD(senderMSISDN, escrowMSISDN, amountToSell)
//             console.log('tx details', txReceipt)
            
//             if(txReceipt === 'failed'){
//                 msg += `END Your transaction has failed due to insufficient balance`
//                 res.send(msg)
//                 return
//             }
            
//             let url = await getTxIdUrl(txReceipt)
//             console.log('tx URL', url)
            
//             let message_to_seller = `You have a cash pick-up order for  ${amountToSell} sent to ${escrowMSISDN}.\nTransaction URL: ${url}`
//             let message_to_canza = `You have recived Naira ${amountToSell} from ${sellerMSISDN}.\nTransaction Link: ${url}`
//             let message_to_agent = `You have received Naira ${amountToSell} from ${sellerMSISDN}.\nTransaction Link: ${url}`
            
//             sendMessage(sellerMSISDN, message_to_seller)
//             sendMessage(escrowMSISDN, message_to_canza)
//             sendMessage(agentMSISDN, message_to_agent)
            
//             msg += `END \nTransaction succesful. \nPlease check your SMS messages for updates. \nYou have sold ` + amountToSell + ` cUSD to ` + escrowMSISDN + ` Canza Celo Account`




//         res.send(msg)

//     } else if (data[0] == '2' && data[1] !== '' && data[2] !== '' && data[3] !== '' && data[4] !== '' && data[5] == '2') {
//         msg += `CON Please enter Recipient phoneNumber`
//         res.send(msg)
//     }
    
//     // #3 current market price from coingecko
//     else if (data[0] == '3' && data[1] == null) {
//         msg += `CON select any option to view current market data
//         1. Bitcoin Current Price
//         2. Etherum Currrent Price
//         3. Celo Currrent Price`
//         msg += footer
//         res.send(msg)
//     } else if ( data[0] == '3' && data[1] == '1') {
//         const btc_ngn_usd = await client.simplePrice({ ids: ['bitcoin', 'bitcoin'], vs_currencies: ['ngn', 'usd'] })
        
//         // bitcion market price in both Naira and USD
//         let btc_price_ngn = formartNumber(btc_ngn_usd.bitcoin.ngn, 2)
//         let btc_price_usd = formartNumber(btc_ngn_usd.bitcoin.usd, 2)
        
//         msg += `END 1 BTC is: ` + btc_price_ngn + ` in Naira and ` + btc_price_usd + ` in USD`
//         res.send(msg)
//     } else if ( data[0] == '3' && data[1] == '2') {
//         const eth_ngn_usd = await client.simplePrice({ ids: ['ethereum', 'ethereum'], vs_currencies: ['ngn', 'usd'] })
        
//         // ethereum market price in both Naira and USD
//         let eth_price_ngn = formartNumber(eth_ngn_usd.ethereum.ngn, 2)
//         let eth_price_usd = formartNumber(eth_ngn_usd.ethereum.usd, 2)

//         msg += `END 1 ETH is: ` + eth_price_ngn + ` in Naira and ` + eth_price_usd + ` in USD`
//         res.send(msg)
//     } else if ( data[0] == '3' && data[1] == '3') {
//         const celo_ngn_usd = await client.simplePrice({ ids: ['celo', 'celo'], vs_currencies: ['ngn', 'usd'] })
        
//         // celo market price in both Naira and USD
//         let celo_price_ngn = formartNumber(celo_ngn_usd.celo.ngn, 2)
//         let celo_price_usd = formartNumber(celo_ngn_usd.celo.usd, 2)

//         msg += `END 1 CELO is: ` + celo_price_ngn + ` in Naira and ` + celo_price_usd + ` in USD` 
//         res.send(msg)
//     }
//     // #4 defi and swapping
//     else if (data[0] == '4' && data[1] == null){
//         msg += `CON Defi swaping Feature Coming soon`
//         msg += footer
//         res.send(msg)
//     }
    
//     // #5 account details 
//     else if (data[0] == '5' && data[1] == null){
//         msg += `CON select account information you want to view
//         1. Account Details
//         2. Account Balance
//         3. Forgot Password`
//         msg += footer
//         res.send(msg)
//     } else if (data[0] == '5' && data[1] == '1') {
//         msg = await getAccountDetails(phoneNumber)
//         res.send(msg)
//     } else if (data[0] == '5' && data[1] == '2') {
//         msg = await getAccountBalance(phoneNumber)
//         res.send(msg)
//     } else if (data[0] == '5' && data[1] == '3') {


//         // reset by generating pin
//         // try {
//         //     // getUser Id
//         //     senderMSISDN = phoneNumber
//         //     const user = await getUserAddress(senderMSISDN)
//         //     const userId = user[0]._id
//         //     let newUserPin = await generatePin()
//         //     let hashed_password = encryptionPin(newUserPin)
//         //     console.log("generated pin", hashed_password)

//         //     let reset_pin_message = `Pin reset was successful.\n Your new Pin is ${newUserPin}.`
//         //     sendMessage(senderMSISDN, reset_pin_message)

//         //     console.log("user info to update", { hashed_password })
//         //     await updateUser(userId, { hashed_password })
            
//         //     msg = `END Pin reset was successful.\n Kindly check SMS for Details`;
//         //     res.send(msg)
//         // } catch(error) {
//         //     msg = `END Pin reset failed.`
//         //     res.send(msg)
//         // }
//     }
    
//     // select a correct option
//     else {
//         msg = 'CON Sorry, Please select an option'
//         msg += '\n1: Send'
//         msg += '\n2: Sell'
//         msg += '\n3: Market Prices'
//         msg += '\n4: Swap'
//         msg += '\n5: My Account'
//         res.send(msg)
//     }
})

module.exports = router
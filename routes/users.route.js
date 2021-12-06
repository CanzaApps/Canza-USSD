const express = require('express')
const ContractKit = require('@celo/contractkit')

// import user controller
const { createUser } = require('../controllers/users.controller')

const kit = ContractKit.newKit(process.env.TEST_NET_ALFAJORES)
// console.log("connected to celo!!!!", kit)

const router = express.Router()

router.post("/", async(req, res, next) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body

    console.log('#########', req.body)
    let response = ""
    var data = text.split('*')

    if (text == "") {
        console.log(text)
        response = `CON Choose account information you want to view
        1. Create wallet 
        2. Account balance
        3. Trasnfer Celo
        4. Wallet details`;
    } else if ( data[0] == "1" && data[1] == null ) {
        response = `CON please enter your first name to create an account`
    } else if (data[0] == "1" && data[1] !==  '') {
        first_name = data[1]
        console.log("my name", first_name)
        createUser({firstName: first_name, phoneNumber, WalletAddress: 'WalletAddress', privateKey: 'privateKey'})
        response = `END your wallet address and account created!!!`
    }
    
    
    
    else if (text === "2") {
        response = `CON My account Balance`
    } else if (text === "3") {
        response = `CON Trasnfer Celo`

    } else if (text === "4"){
        response = `CON Wallet details`
    }

    res.send(response);
})

module.exports = router
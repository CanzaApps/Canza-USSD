const Transactions = require('../models/transactions.model')
const { getUserById } = require('../services/user.service')
const User = require('../models/users.model')

exports.createTransaction = async ({userId, coinToSell, amountToSell, cashPickupLocation, localGovernmentArea, remarks, pickupPerson, verificationId, transactionUrl}) => {
    
    const newTransaction = new Transactions({userId, coinToSell, amountToSell, cashPickupLocation, localGovernmentArea, remarks, pickupPerson, verificationId, transactionUrl})
    console.log("transaction created", newTransaction)

    newTransaction.save(function(error){
        console.log(error)
    })
}

exports.getTransactionById = async (transactionId) => {
    const transaction = await Transactions.findById(transactionId)
    return transaction
}

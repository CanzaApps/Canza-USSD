const User = require('../models/users.model')

exports.createUser = ({ firstName, phoneNumber, WalletAddress, privateKey }) => {
    const newUser = new User({ firstName,phoneNumber, WalletAddress, privateKey })

    newUser.save(function(error){
        console.log(error)
    })
}

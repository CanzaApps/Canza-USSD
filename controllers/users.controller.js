const User = require('../models/users.model')

exports.createUser = ({ firstName, lastName, phoneNumber, walletAddress, privateKey, hashed_password }) => {
    const newUser = new User({ firstName, lastName, phoneNumber, walletAddress, privateKey, hashed_password })

    newUser.save(function(error){
        console.log(error)
    })
}

exports.updateUser = async ({ userId, firstName, lastName, hashed_password}) => {
    try {
        const query = {_id: userId}
        const update = {firstName, lastName, hashed_password }
        
        const userDoc = await User.findOneAndUpdate(query, update, {new: true})
        
    } catch (error) {
        
    }

}

exports.getUserAddress = async(phoneNumber) => {
    try {
        const user =  await User.find({ phoneNumber })
        return user

    } catch(error){
        console.log(error, "user not available!!!")
    }
}

exports.verifyUser = async (userId) => {
    try {
        const query = {_id: userId}
        const update = { isVerified: true }
        
        const userDoc = await User.findOneAndUpdate(query, update, {new: true})
        console.log('is verified', userDoc)
    } catch (error) {
        console.log(error, 'unable to update')        
    }
}



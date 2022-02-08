const User = require('../models/users.model')
const { getUserById } = require('../services/user.service')

exports.createUser = ({ firstName, lastName, phoneNumber, walletAddress, privateKey, hashed_password }) => {
    const newUser = new User({ firstName, lastName, phoneNumber, walletAddress, privateKey, hashed_password, isVerified: true })

    newUser.save(function(error){
        console.log(error)
    })
}

exports.updateUser = async (userId, updateBody) => {
    try {
        const query = {_id: userId}
        // find user
        const user = await getUserById(query)
        if(!user) {
            console.log('User not found')
        }
        Object.assign(user, updateBody)
        await user.save()
        console.log("user updated",user)
        return user   
    } catch (error) {
        
    }
}

exports.getUserAddress = async (phoneNumber) => {
    try {
        const user =  await User.find({ phoneNumber })
        return user

    } catch(error){
        console.log(error, "user not available!!!")
    }
}

exports.checkAuth = async (phoneNumber, pin) => {
    User.findOne({phoneNumber}, (err, user) => {
        if(err || !user) {

            console.log(`User with that email ${phoneNumber} does not exist.`)
        }
          console.log("user", user)
        if(!user.authenticate(pin)) {
            console.log("pin donot match", pin)
        }
    })
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

// check if user is verified
exports.isVerified = async (userId) => {
    try {
        const query = {_id: userId}
        const userDoc = await User.findOne(query)
        console.log('is verified', userDoc.isVerified)
        return userDoc.isVerified
    } catch (error) {
        console.log(error, 'unable to update')        
    }
}



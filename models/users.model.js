const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    firstName: String,
    phoneNumber: String, 
    WalletAddress: String,
    privateKey: String 
})

module.exports = mongoose.model('Users', userSchema)
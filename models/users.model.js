const mongoose = require('mongoose')
const { v1: uuidv1 } =  require('uuid')
const crypto = require('crypto')

const { Schema } = mongoose

const userSchema = new Schema({
    firstName: { type: String, trim: true, },
    lastName: { type: String, trim: true, },
    phoneNumber: { type: String, required: true, }, 
    walletAddress: { type: String, required: true, },
    privateKey: { type: String, required: true, },
    hashed_password: { type: String, required: true, minlength: 4, maxlength: 128, },
    salt: { type: String, },
    isVerified: { type: Boolean, default: false, },
    isEmailVerified: { type: Boolean, default: false, },
}, 
{
    timestamps: true,
})

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */



//  virtual pin field
userSchema.virtual('pin').set(function (pin) {
    this._pin = pin
    // this.salt =
})




module.exports = mongoose.model('Users', userSchema)
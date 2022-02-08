const mongoose = require('mongoose')

const { Schema } = mongoose

const agentSchema = new Schema({
    agentName: { type: String, required: true, },
    firstName: { type: String, trim: true, },
    lastName: { type: String, trim: true, },
    phoneNumber: { type: String, required: true, },
    agentLocation: { type: String, required: true, },
    agentEmail: { type: String, required: true, },
    agentCity: { type: String, required: true, },
    isVerified: { type: Boolean, default: false, },
    isEmailVerified: { type: Boolean, default: false, },
    hashed_password: { type: String, required: true, minlength: 4, maxlength: 128, },
}, 
{
    timestamps: true,
})

module.exports = mongoose.model('Agents', agentSchema)
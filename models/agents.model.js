const mongoose = require('mongoose')

const { Schema } = mongoose

const agentSchema = new Schema({
    agentName: { type: String, required: true, },
    firstName: { type: String, trim: true, },
    lastName: { type: String, trim: true, },
    phoneNumber: { type: String, required: true, },
    agentLocation: { type: String, required: true, },
    isVerified: { type: Boolean, default: false, },
}, 
{
    timestamps: true,
})

module.exports = mongoose.model('Agents', agentSchema)
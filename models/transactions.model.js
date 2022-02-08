const mongoose = require('mongoose')

const { Schema } = mongoose

const withdrawalSchema = new Schema({
    agentName: { type: String, required: true, },
    pickupLocation: { type: String, required: true, },
    pickupDate: { type: String, required: true, },
    pickupTime: { type: String, required: true, },
    pickupContact: { type: String, required: true, },
    localGovernmentArea: { type: String, required: true, },
    transactionUrl: { type: String, required: true, },
    verificationCode: { type: String, required: true, },
},
{
    timestamps: true,
})

module.exports = mongoose.model('Withdrawals', userSchema)
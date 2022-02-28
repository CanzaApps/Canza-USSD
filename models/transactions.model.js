const mongoose = require('mongoose')

const { Schema } = mongoose

const transactionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    coinToSell: { type: String, required: true },
    amountToSell: { type: Number, required: true },
    cashPickupLocation: { type: String, required: true, },
    pickupPerson: { type: String, required: true, },
    localGovernmentArea: { type: String, required: true, },
    verificationId: { type: String, required: true, },
    transactionUrl: { type: String, required: true, },
    status: { type: String, required: true, default: 'pending' }, // pending, completed, cancelled
    date: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
},
{
    timestamps: true,
})

module.exports = mongoose.model('Transactions', transactionSchema)


// admin
// adminVerificationCode: { type: String, required: true, },
// adminVerificationStatus: { type: String, required: true, default: 'pending' }, // pending, completed, cancelled
// adminVerificationDate: { type: Date, default: Date.now },
// adminVerificationComment: { type: String, required: true, default: 'pending' }, // pending, completed, cancelled
// adminVerificationCommentDate: { type: Date, default: Date.now },
// adminVerificationCommentUser: { type: Schema.Types.ObjectId, ref: 'User' },

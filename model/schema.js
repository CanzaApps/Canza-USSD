const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserInfo_ = new Schema({
    id: ObjectId,
    phoneNumber: String,
    address: String,
    privateKey: String,
    pin: String
});

const UserInfo = mongoose.model('UserInfo', UserInfo_);

const addUserInfo = ({ phoneNumber, address, privateKey, pin="00000" }) => {

    const user = new UserInfo();

    user.phoneNumber = phoneNumber;
    user.address = address;
    user.pin = pin;
    user.privateKey = privateKey;
    user.save(function(err){
        console.log(err);
    })

}

const userAddressFromDB = async (phoneNumber) => {
    const user = await UserInfo.find({ phoneNumber });

    return user;
}

module.exports = { addUserInfo, userAddressFromDB };

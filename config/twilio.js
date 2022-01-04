// send sms to phone
const sendMessage = async(receiver, message, successCallback, errorCallback) => {
  client.messages.create({
      from: `${process.env.TWILIO_SENDER_PHONE_NUMBER}`,
      to: receiver,
      body: message,
    }).then((message) => {
      console.log(message)
      successCallback()
    }).catch((err) => {
      errorCallback(err)
    })
}
module.exports = { sendMessage,  }

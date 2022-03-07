// africa's talking api
const atCredentials = {
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_API_USERNAME
}

const AfricasTalking = require('africastalking')(atCredentials);

// function to send sms
const sendMessage = async (to, message) => {
  const params = { to: [to], message: message, from: 'Canza-Fin' }
  try {
    const result = await AfricasTalking.SMS.send(params);
    console.log(result);
  } catch(error) {
    console.error(error);
  }
}

module.exports = { sendMessage }
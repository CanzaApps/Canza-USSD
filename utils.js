const crypto = require('crypto')
const { v1: uuidv1 } =  require('uuid')
const randomstring = require('randomstring')

const key = crypto.randomBytes(32) // defining key
const iv = crypto.randomBytes(16) // creating and initializg the static iv

// generate 4 random number pin
function generatePin(){
  return new Promise(resolve => {    
    let loginPin = randomstring.generate({ length: 4, charset: 'numeric' });
    resolve (loginPin);
  });
}

// encryption sha256
const encryptPin = (pin) => {
  const en_key = crypto.createHash('sha256').update(pin).digest('hex')
  return en_key
}

// encrypt text 
const encryptData = async (text) => {
  let cipherText = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
  let encrypted = cipherText.update(text)

  // using concatenation
  encrypted = Buffer.concat([encrypted, cipherText.final()])

  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
}

// decrypt data 
function decryptData (text) {
  let iv = Buffer.from(text.iv, 'hex')
  let encryptedText = Buffer.from(text.encryptedData, 'hex')

  // creating decipher
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
  // updating encrypted text
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

// @params value is number 
// @params decimals is number of decimals to format value to
function formartNumber (val, decimals) {
  val = parseFloat(val) // parse the value as a float value
  return val.toFixed(decimals) // format the value to the specified number of decimal places and return it.
}

function emailIsValid (email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}



module.exports = { generatePin, encryptPin, encryptData, decryptData, formartNumber, emailIsValid }

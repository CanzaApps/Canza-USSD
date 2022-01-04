const crypto = require('crypto')

// defining key
const key = crypto.randomBytes(32);
// creating and initializg the static iv
const iv = crypto.randomBytes(16)

// encryption Key sha256
const encryptionKey = (userPhone) => {
  const en_key = crypto.createHash('sha256').update(userPhone).digest('hex')
  return en_key
}

// encrypt text 
const encryptData = async (text) => {
  let cipherText = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
  
  let encrypted = cipherText.update(text)

  // using concatenation
  encrypted = Buffer.concat([encrypted, cipherText.final()])

  return { iv: iv.toString('hex'),
     encryptedData: encrypted.toString('hex') }
}

// decrypt data 
const decryptData = async (text) => {
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



module.exports = { encryptData, decryptData, formartNumber, emailIsValid }

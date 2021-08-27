
const text = "4*08123674857"

console.log((/4*/).test(text))

const phoneNumber = text.split("*")[1];

console.log(phoneNumber)


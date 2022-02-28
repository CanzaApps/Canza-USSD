const mailgun = require("mailgun-js");
const mg = mailgun({
  apiKey: process.env.MAILGUN_APIKEY,
  domain: process.env.MAILGUN_DOMAIN,
});
// console.log('setting mailgun', mg)

exports.sendEmail = (recipient, message) => {
  return new Promise((resolve, reject) => {
    const data = {
      from: `Canza Finance! <${process.env.MAILGUN_EMAIL_SENDER}>`,
      to: recipient,
      subject: message.subject,
      text: message.text,
    };

    console.log("sending data", data);

    mg.messages().send(data, (error, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

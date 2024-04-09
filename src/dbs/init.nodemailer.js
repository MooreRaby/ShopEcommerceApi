'user strict'


const nodemailer = require('nodemailer')
const smtpEndpoint = process.env.SES_AWS_SMTP_ENDPOINT; // tên server mình sẽ chỉ cách lấy bên dưới
const port = process.env.SES_AWS_SMTP_PORT; // smtp port mình sẽ chỉ cách lấy bên dưới
const senderAddress = process.env.SES_AWS_SMTP_SENDER; // email dùng để gửi đi
const toAddresses = 'xxxxx@gmail.com'; // email người nhận
const smtpUsername = process.env.SES_AWS_SMTP_USERNAME; // smtp username mà bạn đã download ở trên 
const smtpPassword = process.env.SES_AWS_SMTP_PASSWORD;


const transport = nodemailer.createTransport({
    host: 'email-smtp.ap-southeast-1.amazonaws.com',
    port: port,
    secure: true, // true for 465, false for other ports
    auth: {
        smtpUsername,
        smtpPassword
    }
})

module.exports = transport
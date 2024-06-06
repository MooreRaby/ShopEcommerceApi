'use strict';

const { randomInt } = require('crypto')
const { newOtp } = require('./otp.service')
const { getTemplate } = require('./template.service');
const transport = require('../dbs/init.nodemailer');
const { NotFoundError } = require('../core/error.response');
const { replacePlaceholder } = require('../utils');

const link_verify = process.env.link_verify || `https://wise-iguana-hot.ngrok-free.app/v1/api/user/welcome-back?token=`

const sendEmailLinkVerify = async ({
    html,
    toEmail,
    subject = 'Xác nhận Email đăng ký',
    text = 'xác nhận..'
}) => {
    try {
        const mailOptions = {
            from: 'Milkiway <lephuquy2003official@gmail.com>"',
            to: toEmail,
            subject,
            text,
            html
        }

        transport.sendMail(mailOptions, (err, res) => {
            if (err) {
                return console.log(err);
            }

            console.log('message sent::::', info.messageId);
        })
    } catch (err) {
        console.log(`error send Email: `, err);
        return err
    }
}

const sendEmailToken = async ({
    email = null
}) => {
    try {
        //1. get token
        const token = await newOtp({ email })

        //2. get template
        const template = await getTemplate({
            tem_name: 'HTML EMAIL TOKEN'
        })

        if (!template) {
            throw new NotFoundError('Template not found')
        }

        // 3. replace placeholders
        const content = replacePlaceholder(
            template.tem_html,
            {
                verify_code:  token.otp_token
            }
        )

        //4. send email
        sendEmailLinkVerify({
            html: content,
            toEmail: email,
            subject: 'Vui lòng xác nhận địa chỉ email đăng ký milkyway'
        }).catch(err => console.log(err))

        return 1
    } catch (error) {

    }
}


module.exports = {
    sendEmailToken
}
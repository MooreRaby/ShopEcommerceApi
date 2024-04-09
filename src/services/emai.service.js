'use strict';

const { randomInt } = require('crypto')
const { newOtp } = require('./otp.service')
const { getTemplate } = require('./template.service');
const transport = require('../dbs/init.nodemailer');
const { NotFoundError } = require('../core/error.response');
const { replacePlaceholder } = require('../utils');

const link_verify = process.env.link_verify || `http://localhost:3000/cgp/welcome-back?token=`

const sendEmailLinkVerify = ({
    html,
    toEmail,
    subject = 'Xác nhận Email đăng ký',
    text = 'xác nhận..'
}) => {
    try {
        const mailOptions = {
            from: ' "Milkiway <lephuquy2003official@gmail.com>"',
            to: toEmail,
            subject,
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
                link_verify: link_verify + '' + token
            }
        )

        //4. send email
        sendEmailLinkVerify({
            html: content,
            toEmail: email,
            subject: 'Vui lòng xác nhận địa chỉ email đăng ký milkiway'
        }).catch
    } catch (error) {

    }
}


module.exports = {
    sendEmailToken
}
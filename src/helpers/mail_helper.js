import nodemailer from 'nodemailer';

import { CONFIG } from 'configs/constants';

async function warpedSendMail(mailOptions) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: CONFIG.MAIL_USER_NAME,
                pass: CONFIG.MAIL_PASSWORD
            }
        });

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("error is " + error);
                resolve(false);
            }
            else {
                console.log('Email sent: ' + info.response);
                resolve(mailOptions.text);
            }
        })

    })
}

export { warpedSendMail };

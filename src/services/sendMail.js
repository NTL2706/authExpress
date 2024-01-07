import { warpedSendMail } from '../helpers/mail_helper';
import { CONFIG } from '../configs/constants';

const sendMail = async (toMail, subject, text) => {
    var mailOptions = {
        from: CONFIG.MAIL_USER_NAME,
        to: toMail,
        subject: subject,
        text: text
    };
    let resp = await warpedSendMail(mailOptions);
    console.log(resp)
    return resp;
};

export { sendMail };
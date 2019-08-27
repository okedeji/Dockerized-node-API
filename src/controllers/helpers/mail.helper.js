require('dotenv').config();
module.exports = async (mailer, recipientEmail, recipient) => {
    try {
        let body = `<strong>Hey ${recipient},</strong>
                <p>You just bought an Item from Turing Shop. Thank you for making this order.</p>
                <br />
                <p>Regards</p>`;

        let mailOptions = {
            from: `"Turing Backend Challenge" <${process.env.SENDER_EMAIL}>`,
            to: recipientEmail,
            subject: `Thank you for shopping with us`,
            html: body
        };
        
        let info = await mailer.sendMail(mailOptions)
        return "mail sent"
     
        console.log("Send Customer Email => " + info.message);
    } catch (error) {
        return error
    }
}
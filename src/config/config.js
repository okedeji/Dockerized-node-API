require('dotenv').config();
const   nodemailer = require('nodemailer'),
        sendgridTransport = require('nodemailer-sendgrid-transport');

exports.mailer = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_user : process.env.MAIL_USER,
            api_key : process.env.MAIL_PASSWORD
        }
    }) 
);

exports.fbOpts = {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    profileFields: ["emails", "name"] 
}




